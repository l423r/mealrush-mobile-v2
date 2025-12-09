#!/bin/bash
# Скрипт для получения скриншота с Android устройства через ADB
# Использование: ./screenshot.sh [путь_для_сохранения]

# Проверка наличия ADB
if ! command -v adb &> /dev/null; then
    echo "Ошибка: ADB не найден в PATH. Убедитесь, что Android SDK Platform Tools установлены."
    exit 1
fi

# Проверка подключения устройства
if ! adb devices | grep -q "device$"; then
    echo "Ошибка: Устройство не подключено или не авторизовано."
    echo "Убедитесь, что:"
    echo "  1. USB отладка включена на устройстве"
    echo "  2. Устройство подключено по USB"
    echo "  3. Вы разрешили отладку по USB на устройстве"
    adb devices
    exit 1
fi

# Определение пути для сохранения
if [ -z "$1" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    SCREENSHOT_DIR="$SCRIPT_DIR/../screenshots"
else
    SCREENSHOT_DIR="$1"
fi

# Создание папки, если её нет
mkdir -p "$SCREENSHOT_DIR"

# Генерация имени файла с timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SCREENSHOT_FILE="$SCREENSHOT_DIR/screenshot_$TIMESTAMP.png"

# Временный файл на устройстве
DEVICE_FILE="/sdcard/screenshot_temp.png"

echo "Получение скриншота с устройства..."
adb shell screencap -p "$DEVICE_FILE"

if [ $? -ne 0 ]; then
    echo "Ошибка: Не удалось создать скриншот на устройстве."
    exit 1
fi

echo "Копирование файла на компьютер..."
adb pull "$DEVICE_FILE" "$SCREENSHOT_FILE"

if [ $? -ne 0 ]; then
    echo "Ошибка: Не удалось скопировать файл с устройства."
    exit 1
fi

# Удаление временного файла с устройства
adb shell rm "$DEVICE_FILE"

echo "Скриншот сохранен: $SCREENSHOT_FILE"

# Опционально: открыть скриншот (раскомментируйте следующую строку, если нужно)
# Для Linux: xdg-open "$SCREENSHOT_FILE"
# Для macOS: open "$SCREENSHOT_FILE"



