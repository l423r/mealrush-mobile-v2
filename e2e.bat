@echo off
REM E2E Test Runner для MealRush Mobile V2
REM Поддерживает запуск всех E2E тестов, включая:
REM   - Story 3.1: Create Meal Entry (test_meal_creation.py)
REM   - Story 3.2: Add Products to Meal (test_add_products_to_meal.py)
REM
REM Использование:
REM   e2e.bat           - Запустить с преднастройкой окружения
REM   e2e.bat --skip    - Пропустить преднастройку
REM   e2e.bat --stop    - Остановить все фоновые процессы
REM
REM В интерактивном режиме доступны команды:
REM   f add_products     - Запустить все тесты test_add_products_to_meal.py
REM   c addproducts     - Запустить все тесты класса TestAddProductsToMeal
REM   <ID>              - Запустить тест по ID (автоматически обнаружен)

chcp 65001 >nul
cd /d "C:\mp\mealrush-mobile-v2"
python e2e_runner.py %*
