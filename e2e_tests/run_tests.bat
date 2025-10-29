@echo off
REM Скрипт для запуска E2E тестов на Windows
REM Использование: run_tests.bat [--platform android|ios] [--markers smoke|regression|integration]

setlocal enabledelayedexpansion

set PLATFORM=android
set MARKERS=
set VERBOSE=
set WORKERS=1

REM Парсинг аргументов
:parse
if "%~1"=="" goto endparse
if /i "%~1"=="--platform" (
    set PLATFORM=%~2
    shift
    shift
    goto parse
)
if /i "%~1"=="--markers" (
    set MARKERS=-m %~2
    shift
    shift
    goto parse
)
if /i "%~1"=="--verbose" (
    set VERBOSE=-v -s
    shift
    goto parse
)
if /i "%~1"=="--workers" (
    set WORKERS=%~2
    shift
    shift
    goto parse
)
if /i "%~1"=="--help" (
    echo Использование: %~nx0 [options]
    echo.
    echo Опции:
    echo   --platform PLATFORM    Платформа для тестирования ^(android^|ios^) [default: android]
    echo   --markers MARKERS      Запуск тестов с определенными маркерами ^(smoke^|regression^|integration^)
    echo   --workers N            Количество параллельных процессов [default: 1]
    echo   --verbose              Подробный вывод
    echo   --help                 Показать эту справку
    exit /b 0
)
shift
goto parse
:endparse

echo ==================================================
echo MealRush E2E Tests Runner
echo ==================================================
echo.

REM Проверка наличия Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Ошибка: Python не найден
    exit /b 1
)
echo OK Python найдено

REM Проверка установки зависимостей
echo Проверка зависимостей...
python -c "import appium" 2>nul
if errorlevel 1 (
    echo Установка зависимостей...
    pip install -r requirements.txt
)
echo OK Зависимости установлены

REM Установка переменных окружения
set PLATFORM=%PLATFORM%

REM Создание папки для скриншотов
if not exist screenshots mkdir screenshots

REM Проверка наличия Appium
where appium >nul 2>&1
if errorlevel 1 (
    echo Appium не найден
    echo Установите Appium: npm install -g appium
    exit /b 1
)

echo OK Appium найден

REM Запуск Appium в фоне
echo.
echo Запуск Appium Server...
start /B appium
timeout /t 5 /nobreak >nul

echo OK Appium запущен

REM Запуск тестов
echo.
echo ==================================================
echo Запуск тестов
echo ==================================================
echo Платформа: %PLATFORM%
echo Маркеры: %MARKERS%
echo.

set CMD=pytest %VERBOSE% %MARKERS% --html=report.html --self-contained-html

echo Команда: %CMD%
echo.

REM Запуск тестов
%CMD%

if errorlevel 1 (
    echo.
    echo ==================================================
    echo ER Тесты завершились с ошибками
    echo ==================================================
) else (
    echo.
    echo ==================================================
    echo OK Тесты успешно выполнены
    echo ==================================================
)

REM Открытие отчета
if exist report.html (
    echo.
    echo Отчет сохранен: report.html
    start report.html
)

endlocal
exit /b %ERRORLEVEL%

