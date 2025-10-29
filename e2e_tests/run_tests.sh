#!/bin/bash

# Скрипт для запуска E2E тестов
# Использование: ./run_tests.sh [options]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Параметры по умолчанию
PLATFORM="android"
MARKERS=""
WORKERS="1"
VERBOSE=""

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
  case $1 in
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --markers)
      MARKERS="-m $2"
      shift 2
      ;;
    --workers)
      WORKERS="$2"
      shift 2
      ;;
    --verbose)
      VERBOSE="-v -s"
      shift
      ;;
    --help)
      echo "Использование: $0 [options]"
      echo ""
      echo "Опции:"
      echo "  --platform PLATFORM    Платформа для тестирования (android|ios) [default: android]"
      echo "  --markers MARKERS      Запуск тестов с определенными маркерами (smoke|regression|integration)"
      echo "  --workers N            Количество параллельных процессов [default: 1]"
      echo "  --verbose              Подробный вывод"
      echo "  --help                 Показать эту справку"
      exit 0
      ;;
    *)
      echo "Неизвестная опция: $1"
      exit 1
      ;;
  esac
done

echo "=================================================="
echo "MealRush E2E Tests Runner"
echo "=================================================="
echo ""

# Проверка наличия Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Ошибка: Python3 не найден${NC}"
    exit 1
fi

echo "✓ Python найдено"

# Проверка наличия pip
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}Ошибка: pip3 не найден${NC}"
    exit 1
fi

echo "✓ pip найдено"

# Проверка установки зависимостей
echo "Проверка зависимостей..."
if ! python3 -c "import appium" 2>/dev/null; then
    echo -e "${YELLOW}Установка зависимостей...${NC}"
    pip3 install -r requirements.txt
fi

echo "✓ Зависимости установлены"

# Проверка наличия Appium
if ! command -v appium &> /dev/null; then
    echo -e "${YELLOW}Appium не найден, попытка установки...${NC}"
    npm install -g appium
fi

echo "✓ Appium найден"

# Проверка наличия эмулятора/устройства
if [ "$PLATFORM" == "android" ]; then
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}Ошибка: ADB не найден${NC}"
        exit 1
    fi
    
    DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
    if [ "$DEVICES" -eq 0 ]; then
        echo -e "${RED}Ошибка: Android устройства не найдены${NC}"
        echo "Запустите эмулятор или подключите физическое устройство"
        exit 1
    fi
    
    echo "✓ Android устройство найдено ($DEVICES устройств)"
    
elif [ "$PLATFORM" == "ios" ]; then
    if ! command -v xcrun simctl &> /dev/null; then
        echo -e "${RED}Ошибка: xcrun simctl не найден (только macOS)${NC}"
        exit 1
    fi
    
    echo "✓ iOS Simulator доступен"
fi

# Установка переменных окружения
export PLATFORM=$PLATFORM

# Создание папки для скриншотов
mkdir -p screenshots

# Запуск Appium в фоне
echo ""
echo -e "${YELLOW}Запуск Appium Server...${NC}"
appium &
APPIUM_PID=$!

# Ожидание запуска Appium
sleep 5

# Проверка, что Appium запустился
if ! ps -p $APPIUM_PID > /dev/null; then
    echo -e "${RED}Ошибка: Appium не запустился${NC}"
    exit 1
fi

echo "✓ Appium запущен (PID: $APPIUM_PID)"

# Функция cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}Остановка Appium...${NC}"
    kill $APPIUM_PID 2>/dev/null || true
}

trap cleanup EXIT

# Запуск тестов
echo ""
echo "=================================================="
echo "Запуск тестов"
echo "=================================================="
echo "Платформа: $PLATFORM"
echo "Маркеры: $MARKERS"
echo "Процессов: $WORKERS"
echo ""

if [ "$WORKERS" != "1" ]; then
    WORKER_ARG="-n $WORKERS"
else
    WORKER_ARG=""
fi

# Команда для запуска pytest
CMD="pytest $VERBOSE $MARKERS $WORKER_ARG --html=report.html --self-contained-html"

echo "Команда: $CMD"
echo ""

# Запуск тестов
eval $CMD
TEST_EXIT_CODE=$?

echo ""
echo "=================================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Тесты успешно выполнены${NC}"
else
    echo -e "${RED}✗ Тесты завершились с ошибками${NC}"
fi
echo "=================================================="

# Открытие отчета
if [ -f "report.html" ]; then
    echo ""
    echo "Отчет сохранен: report.html"
    if command -v xdg-open &> /dev/null; then
        xdg-open report.html
    elif command -v open &> /dev/null; then
        open report.html
    fi
fi

exit $TEST_EXIT_CODE

