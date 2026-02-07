"""
Упрощенный тест для добавления продукта к существующему приему пищи

Исходное положение: главный экран с существующим приемом пищи (1 продукт)
Пользователь: qweqwe@gmail.com / qweqweqwe

Тест выполняет:
1. Логин под указанным пользователем
2. Переход на главный экран
3. Открытие существующего приема пищи
4. Добавление нового продукта к приему пищи
5. Проверка что продукт добавлен
"""
import os
import sys
import time
import pytest

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.sign_in_page import SignInPage
from pages.main_page import MainPage
from pages.meal_page import MealPage
from pages.search_page import SearchPage
from pages.meal_element_page import MealElementPage


class TestAddProductToExistingMealSimple:
    """
    Упрощенный тест для добавления продукта к существующему приему пищи
    Использует существующего пользователя (qweqwe@gmail.com)
    """
    
    TEST_EMAIL = "qweqwe@gmail.com"
    TEST_PASSWORD = "qweqweqwe"
    
    def test_add_product_to_existing_meal(self, driver, setup_test_environment):
        """
        Тест добавления продукта к существующему приему пищи
        
        User Flow:
        1. Логин под qweqwe@gmail.com / qweqweqwe
        2. Переход на главный экран
        3. Открытие существующего приема пищи (с 1 продуктом)
        4. Добавление нового продукта (бекон)
        5. Проверка что продукт добавлен (стало 2 продукта)
        """
        print("\n" + "="*60)
        print("ТЕСТ: Добавление продукта к существующему приему пищи")
        print("="*60)
        
        # Шаг 1: Логин
        print(f"\n[STEP 1] Логин под пользователем {self.TEST_EMAIL}")
        sign_in_page = SignInPage(driver)
        
        # Убеждаемся что мы на странице входа
        if not sign_in_page.is_page_loaded(timeout=5):
            print("[STEP 1] ⚠ Не на странице входа, пытаемся перейти...")
            sign_in_page = SignInPage.ensure_sign_in_page(driver)
        
        sign_in_page.take_screenshot('01_sign_in_page')
        
        # Выполняем логин
        print(f"[STEP 1] Ввод email: {self.TEST_EMAIL}")
        sign_in_page.enter_email(self.TEST_EMAIL)
        time.sleep(0.5)
        
        print(f"[STEP 1] Ввод пароля: {'*' * len(self.TEST_PASSWORD)}")
        sign_in_page.enter_password(self.TEST_PASSWORD)
        time.sleep(0.5)
        
        print("[STEP 1] Нажатие кнопки входа...")
        sign_in_page.click_login_button()
        time.sleep(3)  # Ждем перехода на главный экран
        
        # Шаг 2: Проверка главного экрана
        print("\n[STEP 2] Проверка загрузки главного экрана")
        main_page = MainPage(driver)
        
        # Ждем загрузки главного экрана
        main_loaded = False
        for attempt in range(10):
            if main_page.is_page_loaded(timeout=2):
                main_loaded = True
                print(f"[STEP 2] ✓ Главный экран загружен (попытка {attempt + 1})")
                break
            time.sleep(1)
        
        if not main_loaded:
            pytest.fail("Главный экран не загрузился после логина")
        
        main_page.take_screenshot('02_main_page_loaded')
        
        # Шаг 3: Открытие существующего приема пищи
        print("\n[STEP 3] Открытие существующего приема пищи")
        print("-" * 60)
        
        # Ищем первый прием пищи на главном экране
        meals_count = main_page.get_meals_count(debug=True)
        print(f"[STEP 3] Найдено приемов пищи на главном экране: {meals_count}")
        
        if meals_count == 0:
            pytest.fail("На главном экране нет приемов пищи для тестирования")
        
        # Кликаем на первый прием пищи
        print("[STEP 3] Кликаем на первый прием пищи...")
        clicked = main_page.click_meal_card(0)
        if not clicked:
            # Пробуем альтернативный способ - по типу
            clicked = main_page.click_meal_card('Завтрак')
        
        if not clicked:
            pytest.fail("Не удалось открыть прием пищи")
        
        # Ждем загрузки MealScreen
        meal_page = MealPage(driver)
        if not meal_page.is_page_loaded(timeout=5):
            pytest.fail("MealScreen не загрузился")
        
        print("[STEP 3] ✓ MealScreen открыт")
        meal_page.take_screenshot('03_meal_screen_opened')
        
        # Шаг 4: Проверка начального состояния
        print("\n[STEP 4] Проверка начального состояния приема пищи")
        print("-" * 60)
        
        initial_elements_count = meal_page.get_elements_count(debug=True)
        print(f"[STEP 4] Начальное количество продуктов в приеме пищи: {initial_elements_count}")
        
        if initial_elements_count == 0:
            print("[STEP 4] ⚠ В приеме пищи нет продуктов, но продолжаем тест")
        
        # Шаг 5: Добавление нового продукта
        print("\n[STEP 5] Добавление нового продукта (бекон)")
        print("-" * 60)
        
        search_page = SearchPage(driver)
        
        # Открываем поиск через FAB (кнопка "+" внизу экрана)
        print("[STEP 5] Открываем поиск продуктов через FAB кнопку '+'...")
        meal_page.take_screenshot('05_before_fab_click')
        try:
            meal_page.click_add_product(debug=True)
            print("[STEP 5] ✓ FAB кнопка нажата")
        except Exception as e:
            meal_page.take_screenshot('05_error_fab_click_failed')
            pytest.fail(f"Не удалось нажать на FAB кнопку для добавления продукта: {e}")
        
        # Ждем загрузки SearchScreen
        time.sleep(1)  # Даем время на навигацию
        
        if not search_page.is_page_loaded(timeout=5):
            # Делаем скриншот для отладки
            meal_page.take_screenshot('05_error_fab_not_working')
            pytest.fail("SearchScreen не открылся после нажатия на FAB кнопку")
        
        print("[STEP 5] ✓ SearchScreen открыт")
        search_page.take_screenshot('04_search_screen_opened')
        
        # Ищем продукт "бекон"
        print("[STEP 5] Ищем продукт 'бекон'...")
        search_page.search_product("бекон", take_screenshot=False)
        
        products_count = search_page.get_products_count()
        print(f"[STEP 5] Найдено продуктов: {products_count}")
        
        if products_count == 0:
            pytest.fail("Продукты не найдены в поиске")
        
        # Кликаем на первый продукт
        print("[STEP 5] Кликаем на первый продукт...")
        search_page.click_product(0)
        
        # Шаг 6: Указание количества и добавление
        print("\n[STEP 6] Указание количества и добавление продукта")
        print("-" * 60)
        
        meal_element_page = MealElementPage(driver)
        if not meal_element_page.is_page_loaded(timeout=3):
            pytest.fail("MealElementScreen не загрузился")
        
        print("[STEP 6] ✓ MealElementScreen загружен")
        meal_element_page.take_screenshot('05_meal_element_screen')
        
        # Указываем количество (150г)
        quantity = 150
        print(f"[STEP 6] Вводим количество: {quantity}г")
        meal_element_page.enter_quantity(quantity)
        time.sleep(0.3)  # Ждем пересчета калорий
        
        # Проверяем что количество установлено
        entered_quantity = meal_element_page.get_quantity()
        print(f"[STEP 6] Установленное количество: {entered_quantity}")
        
        # Получаем калории с экрана (если доступны)
        calories_on_screen = meal_element_page.get_calories()
        if calories_on_screen:
            print(f"[STEP 6] Калории на экране: {calories_on_screen}")
        
        # Добавляем продукт к существующему meal
        # ВАЖНО: После добавления продукта приложение возвращает на главный экран
        print("[STEP 6] Нажимаем кнопку добавления...")
        meal_element_page.click_add_button(
            wait_for_main_screen=True,  # Ожидаем главный экран (логика приложения)
            handle_confirm_dialog='add_to_existing'
        )
        
        # После добавления продукта приложение возвращает на главный экран
        print("[STEP 6] Ожидание возврата на главный экран...")
        if not main_page.is_page_loaded(timeout=5):
            pytest.fail("Главный экран не загрузился после добавления продукта")
        
        print("[STEP 6] ✓ Вернулись на главный экран (ожидаемое поведение)")
        main_page.take_screenshot('06_main_screen_after_add')
        
        # Открываем MealScreen снова для проверки добавленного продукта
        print("[STEP 6] Открываем MealScreen снова для проверки...")
        clicked = main_page.click_meal_card(0)
        if not clicked:
            # Пробуем альтернативный способ
            clicked = main_page.click_meal_card('Завтрак')
        
        if not clicked:
            pytest.fail("Не удалось открыть MealScreen после добавления продукта")
        
        # Ждем загрузки MealScreen
        if not meal_page.is_page_loaded(timeout=5):
            pytest.fail("MealScreen не загрузился после повторного открытия")
        
        print("[STEP 6] ✓ MealScreen открыт для проверки")
        meal_page.take_screenshot('07_meal_screen_for_verification')
        
        # Шаг 7: Проверка что продукт добавлен
        print("\n[STEP 7] Проверка что продукт добавлен")
        print("-" * 60)
        
        # Ждем обновления количества элементов на MealScreen
        print("[STEP 7] Ожидание обновления количества элементов на MealScreen...")
        final_elements_count = initial_elements_count
        
        # Даем время на обновление данных после открытия MealScreen
        time.sleep(1)
        
        for attempt in range(10):
            current_count = meal_page.get_elements_count(debug=(attempt == 0))
            if current_count != initial_elements_count:
                final_elements_count = current_count
                print(f"[STEP 7] ✓ Количество элементов обновилось: {initial_elements_count} → {final_elements_count}")
                break
            time.sleep(0.5)
        
        print(f"[STEP 7] Финальное количество продуктов: {final_elements_count}")
        
        # Проверяем что продукт добавлен
        assert final_elements_count > initial_elements_count, \
            f"Продукт не был добавлен: было {initial_elements_count}, стало {final_elements_count}"
        
        print(f"[STEP 7] ✓ Продукт успешно добавлен: {initial_elements_count} → {final_elements_count}")
        
        # Проверяем что продукт отображается в списке
        print("[STEP 7] Проверка отображения добавленного продукта...")
        element_name = meal_page.get_element_name(final_elements_count - 1)
        if element_name:
            print(f"[STEP 7] ✓ Название добавленного продукта: {element_name}")
            # Проверяем, что это не просто иконка или служебный текст
            if len(element_name.strip()) > 1 and not element_name.strip().startswith('['):
                print(f"[STEP 7] ✓ Продукт найден: {element_name}")
            else:
                print("[STEP 7] ⚠ Название продукта слишком короткое или служебное")
        else:
            print("[STEP 7] ⚠ Название продукта не найдено (может быть нормально)")
        
        # Проверяем общие калории
        total_calories = meal_page.get_total_calories()
        print(f"[STEP 7] Общие калории в приеме пищи: {total_calories}")
        if total_calories > 0:
            print(f"[STEP 7] ✓ Общие калории отображаются: {total_calories}")
        else:
            print("[STEP 7] ⚠ Общие калории не отображаются (может быть нормально, если данные еще не обновились)")
        
        # Финальный скриншот
        meal_page.take_screenshot('08_final_state')
        
        print("\n" + "="*60)
        print("✓ ТЕСТ УСПЕШНО ЗАВЕРШЕН")
        print(f"✓ Продукт добавлен: {initial_elements_count} → {final_elements_count} продуктов")
        print("="*60)
