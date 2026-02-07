@echo off
REM Скрипт для запуска упрощенного теста добавления продукта к приему пищи
REM Тест логинится под qweqwe@gmail.com и добавляет продукт к существующему приему пищи

echo ========================================
echo Запуск теста добавления продукта к приему пищи
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

python -m pytest tests/test_add_product_to_existing_meal_simple.py::TestAddProductToExistingMealSimple::test_add_product_to_existing_meal ^
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
