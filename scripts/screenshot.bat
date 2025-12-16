@echo off
REM Скрипт для получения скриншота с Android устройства через ADB
REM Использование: screenshot.bat [путь_для_сохранения]

setlocal enabledelayedexpansion

REM Проверка наличия ADB
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo Ошибка: ADB не найден в PATH. Убедитесь, что Android SDK Platform Tools установлены.
    exit /b 1
)

REM Проверка подключения устройства
adb devices | findstr /R "device$" >nul
if %errorlevel% neq 0 (
    echo Ошибка: Устройство не подключено или не авторизовано.
    echo Убедитесь, что:
    echo   1. USB отладка включена на устройстве
    echo   2. Устройство подключено по USB
    echo   3. Вы разрешили отладку по USB на устройстве
    adb devices
    exit /b 1
)

REM Создание папки для скриншотов, если не указана
if "%~1"=="" (
    set SCREENSHOT_DIR=%~dp0..\screenshots
) else (
    set SCREENSHOT_DIR=%~1
)

REM Создание папки, если её нет
if not exist "!SCREENSHOT_DIR!" mkdir "!SCREENSHOT_DIR!"

REM Генерация имени файла с timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=!datetime:~0,8!_!datetime:~8,6!
set SCREENSHOT_FILE=!SCREENSHOT_DIR!\screenshot_!timestamp!.png

REM Временный файл на устройстве
set DEVICE_FILE=/sdcard/screenshot_temp.png

echo Получение скриншота с устройства...
adb shell screencap -p %DEVICE_FILE%

if %errorlevel% neq 0 (
    echo Ошибка: Не удалось создать скриншот на устройстве.
    exit /b 1
)

echo Копирование файла на компьютер...
adb pull %DEVICE_FILE% "!SCREENSHOT_FILE!"

if %errorlevel% neq 0 (
    echo Ошибка: Не удалось скопировать файл с устройства.
    exit /b 1
)

REM Удаление временного файла с устройства
adb shell rm %DEVICE_FILE%

echo Скриншот сохранен: !SCREENSHOT_FILE!

REM Опционально: открыть скриншот (раскомментируйте следующую строку, если нужно)
REM start "" "!SCREENSHOT_FILE!"

endlocal








