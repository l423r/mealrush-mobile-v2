@echo off
REM Скрипт для запуска теста поиска всех приемов пищи
REM Тест логинится под qweqwe@gmail.com и ищет все 6 приемов пищи на главном экране

echo ========================================
echo Запуск теста поиска всех приемов пищи
echo ========================================
echo.

REM Переходим в директорию скрипта
cd /d %~dp0

REM Проверяем наличие виртуального окружения
if exist "venv\Scripts\activate.bat" (
    echo Активация виртуального окружения...
    call venv\Scripts\activate.bat
) else (
    echo Виртуальное окружение не найдено, используем системный Python
)

REM Запускаем тест
echo.
echo Запуск теста...
echo.

python -m pytest tests/test_find_all_meals.py::TestFindAllMeals::test_find_all_meals_on_main_screen ^
    -v ^
    -s ^
    --tb=short ^
    --capture=no

REM Проверяем код возврата
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Тест выполнен успешно!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Тест завершился с ошибкой (код: %ERRORLEVEL%)
    echo ========================================
)

echo.
pause
