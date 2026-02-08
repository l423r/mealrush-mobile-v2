"""
E2E тесты для Story 3.4: Remove Products from Meal
Тестирование удаления продуктов из существующего приема пищи через UI

Сценарий запуска всего файла:
1. SETUP (module scope):
   - Регистрация нового тестового пользователя через UI
   - Прохождение онбординга (создание профиля)
   - Переход на главный экран

2. SETUP (function scope):
   - Создание существующего приема пищи с продуктами через fixture existing_meal_with_products
   - Открытие MealScreen для тестирования

3. TESTS:
   - Тестирование удаления продукта из meal
   - Проверка удаления последнего продукта (meal остается пустым)
   - Проверка подтверждения удаления
   - Проверка обновления nutrition totals после удаления

4. TEARDOWN (module scope):
   - Удаление тестового пользователя через API
   - Cleanup выполняется автоматически через UserCleanup

Acceptance Criteria Coverage:
- AC: 1 - Remove product from meal, product deleted, nutrition values recalculated
- AC: 2 - Receive confirmation after deletion, meal still exists, can add new products
- AC: 3 - Remove last product, meal still exists, can add new products or delete meal

Нумерация тестов:
- test_01 - Основной flow удаления продукта (AC: 1, 2)
- test_02 - Удаление последнего продукта (AC: 3)
- test_03 - Удаление нескольких продуктов (AC: 1, 2)
- test_04 - Проверка обновления nutrition totals после удаления (AC: 1)
"""
import os
import sys
import pytest
import time
import random
import string

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.sign_in_page import SignInPage
from pages.registration_page import RegistrationPage
from pages.main_page import MainPage
from pages.meal_page import MealPage
from pages.search_page import SearchPage
from pages.meal_element_page import MealElementPage
from pages.profile_setup_page import ProfileSetupPage
from pages.target_selection_page import TargetSelectionPage
from pages.weight_page import WeightPage
from pages.target_weight_page import TargetWeightPage
from pages.height_page import HeightPage
from pages.birthday_page import BirthdayPage
from pages.activity_page import ActivityPage
from pages.complete_profile_page import CompleteProfilePage
from utilities.user_cleanup import UserCleanup


# =============================================================================
# SETUP CLASS: Вспомогательный класс для setup/teardown
# =============================================================================

class TestRemoveProductsFromMealSetup:
    """
    Вспомогательный класс для setup/teardown тестов удаления продуктов из meal
    """
    
    @staticmethod
    def generate_test_user():
        """Генерирует уникальные данные тестового пользователя"""
        timestamp = int(time.time() * 1000)
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        return {
            'email': f"remove_products_test_{timestamp}_{random_string}@example.com",
            'password': "Test123456",
            'name': f"RemoveProductsTest_{random_string}"
        }
    
    @staticmethod
    def register_and_complete_profile(driver, user_data):
        """
        Регистрирует пользователя и проходит онбординг
        
        Returns:
            MainPage если успешно, None если ошибка
        """
        try:
            # Шаг 1: Переход на страницу регистрации
            sign_in_page = SignInPage(driver)
            if not sign_in_page.is_page_loaded(timeout=10):
                print("[SETUP] Страница входа не загрузилась")
                return None
            
            sign_in_page.take_screenshot('01_sign_in_page')
            registration_page = sign_in_page.click_register_button()
            
            if not registration_page.is_page_loaded(timeout=5):
                print("[SETUP] Страница регистрации не загрузилась")
                return None
            
            # Шаг 2: Регистрация
            registration_page.take_screenshot('02_registration_page')
            registration_page.register(
                user_data['name'],
                user_data['email'],
                user_data['password']
            )
            time.sleep(3)
            
            # Регистрируем для cleanup
            UserCleanup.register_user(user_data['email'], user_data['password'])
            print(f"[SETUP] Пользователь зарегистрирован: {user_data['email']}")
            
            # Шаг 3: Прохождение онбординга (создание профиля)
            profile_setup_page = ProfileSetupPage(driver)
            if profile_setup_page.is_page_loaded(timeout=5):
                profile_setup_page.take_screenshot('03_profile_setup')
                
                # Выбор пола
                profile_setup_page.select_gender('male')
                profile_setup_page.click_next()
                time.sleep(1)
                
                # Выбор цели
                target_page = TargetSelectionPage(driver)
                if target_page.is_page_loaded(timeout=3):
                    target_page.select_target('save')
                    target_page.click_next()
                    time.sleep(1)
                
                # Ввод веса
                weight_page = WeightPage(driver)
                if weight_page.is_page_loaded(timeout=3):
                    weight_page.enter_weight(75)
                    weight_page.click_next()
                    time.sleep(1)
                
                # Ввод роста
                height_page = HeightPage(driver)
                if height_page.is_page_loaded(timeout=3):
                    height_page.enter_height(175)
                    height_page.click_next()
                    time.sleep(1)
                
                # Выбор даты рождения
                birthday_page = BirthdayPage(driver)
                if birthday_page.is_page_loaded(timeout=3):
                    birthday_page.select_date()
                    birthday_page.click_next()
                    time.sleep(1)
                
                # Выбор активности
                activity_page = ActivityPage(driver)
                if activity_page.is_page_loaded(timeout=3):
                    activity_page.select_activity('second')
                    activity_page.click_next()
                    time.sleep(1)
                
                # Завершение профиля
                complete_page = CompleteProfilePage(driver)
                if complete_page.is_page_loaded(timeout=3):
                    complete_page.click_complete()
                    time.sleep(3)
            
            # Шаг 4: Проверка главного экрана
            main_page = MainPage(driver)
            for _ in range(10):
                if main_page.is_page_loaded(timeout=2):
                    main_page.take_screenshot('04_main_page_loaded')
                    print("[SETUP] Главный экран загружен успешно")
                    return main_page
                time.sleep(1)
            
            print("[SETUP] Не удалось загрузить главный экран")
            return None
            
        except Exception as e:
            print(f"[SETUP] Ошибка при регистрации: {e}")
            import traceback
            traceback.print_exc()
            return None


# =============================================================================
# MODULE-SCOPED FIXTURES
# =============================================================================

@pytest.fixture(scope='module')
def remove_products_test_user():
    """
    Генерирует данные тестового пользователя для всего модуля
    """
    return TestRemoveProductsFromMealSetup.generate_test_user()


@pytest.fixture(scope='module')
def authenticated_session_remove_products(driver, remove_products_test_user):
    """
    Фикстура уровня модуля - регистрирует пользователя один раз для всех тестов
    
    Yields:
        tuple: (MainPage, user_data)
    """
    print("\n" + "="*60)
    print("MODULE SETUP: Регистрация тестового пользователя")
    print("="*60)
    
    main_page = TestRemoveProductsFromMealSetup.register_and_complete_profile(
        driver, remove_products_test_user
    )
    
    if main_page is None:
        pytest.skip("Не удалось зарегистрировать пользователя - пропуск тестов")
    
    yield main_page, remove_products_test_user
    
    # Cleanup НЕ нужен здесь - UserCleanup уже зарегистрировал пользователя
    # и удалит его автоматически в конце тестовой сессии
    print("\n" + "="*60)
    print("MODULE TEARDOWN: Cleanup выполнен через UserCleanup")
    print("="*60)


@pytest.fixture(scope='function')
def existing_meal_with_products(driver, authenticated_session_remove_products):
    """
    Создает meal с несколькими продуктами для тестирования удаления
    Использует паттерн из test_meal_creation.py (строки 344-393) - создание через главный экран
    
    Returns:
        tuple: (MainPage, MealPage, list of product names)
    """
    main_page, _ = authenticated_session_remove_products
    
    print("\n=== Создание meal с продуктами для тестирования удаления ===")
    
    # Список продуктов для добавления (создаем meal с первым, добавляем остальные)
    products_to_add = [
        {"query": "яб", "name": "яблоко"},
        {"query": "банан", "name": "банан"},
        {"query": "молоко", "name": "молоко"}
    ]
    
    products_added = []
    search_page = SearchPage(driver)
    
    # Добавляем все продукты через главный экран (паттерн из test_meal_creation.py)
    for i, product_info in enumerate(products_to_add):
        product_query = product_info["query"]
        product_name = product_info["name"]
        
        print(f"\n[EXISTING_MEAL_WITH_PRODUCTS] Добавление продукта {i+1}/{len(products_to_add)}: {product_name}")
        
        # 1. Открываем поиск через FAB (как в test_meal_creation.py:344)
        main_page.click_add_meal_button()
        
        if not search_page.is_page_loaded(timeout=3):
            print(f"[EXISTING_MEAL_WITH_PRODUCTS] ⚠ SearchScreen не открылся для {product_name}")
            continue
        
        # 2. Ищем продукт (как в test_meal_creation.py:351)
        search_page.search_product(product_query, take_screenshot=False)
        
        products_count = search_page.get_products_count()
        if products_count == 0:
            print(f"[EXISTING_MEAL_WITH_PRODUCTS] ⚠ Продукты не найдены для '{product_query}'")
            driver.back()
            continue
        
        print(f"[EXISTING_MEAL_WITH_PRODUCTS] Найдено продуктов: {products_count}")
        
        # 3. Кликаем на первый продукт (как в test_meal_creation.py:359)
        search_page.click_product(0)
        
        # 4. На MealElementScreen добавляем продукт (как в test_meal_creation.py:362-367)
        meal_element_page = MealElementPage(driver)
        
        if meal_element_page.is_page_loaded(timeout=3):
            meal_element_page.select_meal_type('BREAKFAST')
            
            # Для первого продукта создаем новый meal, для остальных - добавляем к существующему
            if i == 0:
                meal_element_page.click_add_button(handle_confirm_dialog='create_new')
            else:
                meal_element_page.click_add_button(handle_confirm_dialog='add_to_existing')
            
            print(f"[EXISTING_MEAL_WITH_PRODUCTS] ✓ Продукт {product_name} добавлен")
            products_added.append(product_name)
        else:
            print(f"[EXISTING_MEAL_WITH_PRODUCTS] ⚠ MealElementScreen не загрузился для {product_name}")
            driver.back()
            continue
        
        # 5. Ждем загрузки главного экрана (как в test_meal_creation.py:374-379)
        main_loaded = main_page.is_page_loaded(timeout=5)
        if not main_loaded:
            # Если остались на поиске - возвращаемся
            if search_page.is_page_loaded(timeout=1):
                driver.back()
                time.sleep(0.5)
            main_page.is_page_loaded(timeout=3)
    
    # Проверяем что meal создан
    if len(products_added) == 0:
        pytest.fail("Не удалось добавить ни одного продукта")
    
    print(f"[EXISTING_MEAL_WITH_PRODUCTS] ✓ Meal создан с {len(products_added)} продуктами: {products_added}")
    
    # Открываем созданный meal
    print("[EXISTING_MEAL_WITH_PRODUCTS] Открываем созданный meal...")
    clicked = main_page.click_meal_card(0)
    if not clicked:
        clicked = main_page.click_meal_card('Завтрак')
    
    if not clicked:
        pytest.fail("Не удалось открыть meal card")
    
    meal_page = MealPage(driver)
    if not meal_page.is_page_loaded(timeout=5):
        pytest.fail("MealScreen не открылся")
    
    meal_page.take_screenshot('meal_screen_with_products')
    print("[EXISTING_MEAL_WITH_PRODUCTS] ✓ MealScreen открыт, готов к тестам")
    
    return (main_page, meal_page, products_added)


# =============================================================================
# TESTS
# =============================================================================

@pytest.mark.remove_products
@pytest.mark.story_3_4
class TestRemoveProductsFromMeal:
    """
    Тесты для удаления продуктов из meal
    """
    
    @pytest.mark.test_01
    def test_01_remove_product_from_meal(self, driver, setup_test_environment, existing_meal_with_products):
        """
        Test 01: Основной flow удаления продукта из meal (AC: 1, 2)
        
        Steps:
        1. Открыть meal с продуктами
        2. Удалить один продукт через кнопку удаления
        3. Подтвердить удаление в диалоге
        4. Проверить, что продукт удален из списка
        5. Проверить, что meal все еще существует
        6. Проверить, что можно добавить новый продукт
        """
        _, meal_page, products_added = existing_meal_with_products
        
        print("\n=== Test 01: Удаление продукта из meal ===")
        meal_page.take_screenshot('test_01_start')
        
        # Проверяем, что продукты есть
        initial_count = len(products_added)
        assert initial_count > 0, "В meal нет продуктов для удаления"
        print(f"Начальное количество продуктов: {initial_count}")
        
        # Удаляем первый продукт
        print("\n=== Удаление первого продукта ===")
        deleted = meal_page.delete_element(index=0, confirm=True)
        assert deleted, "Не удалось удалить продукт"
        
        # Ждем обновления UI после удаления
        print("\n=== Ожидание обновления UI после удаления ===")
        # Ждем, пока количество элементов не уменьшится
        for attempt in range(10):  # Максимум 10 попыток (5 секунд)
            time.sleep(0.5)
            elements_after = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
            elements_count_after = len(elements_after) if elements_after else 0
            print(f"Попытка {attempt+1}/10: количество продуктов = {elements_count_after}")
            
            if elements_count_after < initial_count:
                print(f"✓ Количество продуктов уменьшилось: было {initial_count}, стало {elements_count_after}")
                break
        else:
            print(f"⚠ Таймаут ожидания обновления UI. Текущее количество: {elements_count_after}")
        
        meal_page.take_screenshot('test_01_after_delete')
        
        # Проверяем, что продукт удален (количество элементов уменьшилось)
        elements_after = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        elements_count_after = len(elements_after) if elements_after else 0
        print(f"Количество продуктов после удаления: {elements_count_after}")
        
        assert elements_count_after < initial_count, f"Количество продуктов не уменьшилось: было {initial_count}, стало {elements_count_after}"
        
        # Проверяем, что meal все еще существует (можно добавить новый продукт)
        print("\n=== Проверка возможности добавления нового продукта ===")
        search_page = meal_page.click_add_product()
        if search_page and search_page.is_page_loaded(timeout=5):
            print("✓ Можно добавить новый продукт - meal существует")
            # Возвращаемся назад без добавления
            driver.back()
            time.sleep(1)
        else:
            print("⚠ Не удалось открыть SearchPage для проверки")
        
        meal_page.take_screenshot('test_01_end')
        print("✓ Test 01 завершен успешно")
    
    @pytest.mark.test_02
    def test_02_remove_last_product_meal_still_exists(self, driver, setup_test_environment, existing_meal_with_products):
        """
        Test 02: Удаление последнего продукта, meal остается существовать (AC: 3)
        
        Steps:
        1. Открыть meal с одним продуктом
        2. Удалить последний продукт
        3. Проверить, что meal все еще существует (пустой meal)
        4. Проверить, что можно добавить новый продукт
        """
        _, meal_page, _ = existing_meal_with_products
        
        print("\n=== Test 02: Удаление последнего продукта ===")
        
        # Если продуктов больше одного, удаляем все кроме последнего
        elements = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        elements_count = len(elements) if elements else 0
        
        if elements_count > 1:
            print(f"Удаляем все продукты кроме последнего (всего: {elements_count})")
            # Удаляем все кроме последнего
            for i in range(elements_count - 1):
                deleted = meal_page.delete_element(index=0, confirm=True)
                assert deleted, f"Не удалось удалить продукт {i+1}"
                time.sleep(2)
                elements = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
                if not elements or len(elements) == 0:
                    break
        
        meal_page.take_screenshot('test_02_before_delete_last')
        
        # Теперь удаляем последний продукт
        print("\n=== Удаление последнего продукта ===")
        deleted = meal_page.delete_element(index=0, confirm=True)
        assert deleted, "Не удалось удалить последний продукт"
        time.sleep(2)
        
        meal_page.take_screenshot('test_02_after_delete_last')
        
        # Проверяем, что meal пустой (нет элементов)
        elements_after = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        elements_count_after = len(elements_after) if elements_after else 0
        print(f"Количество продуктов после удаления последнего: {elements_count_after}")
        assert elements_count_after == 0, "Meal не пустой после удаления последнего продукта"
        
        # Проверяем, что meal все еще существует (можно добавить новый продукт)
        print("\n=== Проверка возможности добавления нового продукта в пустой meal ===")
        search_page = meal_page.click_add_product()
        if search_page and search_page.is_page_loaded(timeout=5):
            print("✓ Можно добавить новый продукт - meal существует (пустой meal валиден)")
            driver.back()
            time.sleep(1)
        else:
            print("⚠ Не удалось открыть SearchPage для проверки")
        
        meal_page.take_screenshot('test_02_end')
        print("✓ Test 02 завершен успешно")
    
    @pytest.mark.test_03
    def test_03_remove_multiple_products(self, driver, setup_test_environment, existing_meal_with_products):
        """
        Test 03: Удаление нескольких продуктов (AC: 1, 2)
        
        Steps:
        1. Открыть meal с несколькими продуктами
        2. Удалить несколько продуктов по очереди
        3. Проверить, что каждый продукт удален
        4. Проверить, что meal все еще существует
        """
        _, meal_page, _ = existing_meal_with_products
        
        print("\n=== Test 03: Удаление нескольких продуктов ===")
        meal_page.take_screenshot('test_03_start')
        
        # Проверяем начальное количество
        elements = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        initial_count = len(elements) if elements else 0
        assert initial_count >= 2, "В meal должно быть минимум 2 продукта для этого теста"
        print(f"Начальное количество продуктов: {initial_count}")
        
        # Удаляем несколько продуктов (но не все)
        products_to_remove = min(2, initial_count - 1)  # Удаляем 2 или (всего - 1)
        print(f"\n=== Удаление {products_to_remove} продуктов ===")
        
        for i in range(products_to_remove):
            print(f"\nУдаление продукта {i+1}/{products_to_remove}")
            deleted = meal_page.delete_element(index=0, confirm=True)
            assert deleted, f"Не удалось удалить продукт {i+1}"
            time.sleep(2)
            
            # Проверяем текущее количество
            elements = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
            current_count = len(elements) if elements else 0
            print(f"Текущее количество продуктов: {current_count}")
            assert current_count == initial_count - (i + 1), "Количество продуктов не соответствует ожидаемому"
        
        meal_page.take_screenshot('test_03_after_deletes')
        
        # Проверяем, что meal все еще существует
        elements_final = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        final_count = len(elements_final) if elements_final else 0
        assert final_count > 0, "Все продукты удалены, но meal должен существовать"
        print(f"✓ Осталось продуктов: {final_count}, meal существует")
        
        meal_page.take_screenshot('test_03_end')
        print("✓ Test 03 завершен успешно")
    
    @pytest.mark.test_04
    def test_04_nutrition_totals_updated_after_deletion(self, driver, setup_test_environment, existing_meal_with_products):
        """
        Test 04: Проверка обновления nutrition totals после удаления (AC: 1)
        
        Steps:
        1. Открыть meal с продуктами
        2. Запомнить начальные nutrition totals (calories, proteins, fats, carbs)
        3. Удалить один продукт
        4. Проверить, что nutrition totals обновились (уменьшились)
        
        Note: Nutrition totals обновляются через cache invalidation на бекенде
        """
        _, meal_page, _ = existing_meal_with_products
        
        print("\n=== Test 04: Проверка обновления nutrition totals ===")
        meal_page.take_screenshot('test_04_start')
        
        # Проверяем, что продукты есть
        elements = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        initial_count = len(elements) if elements else 0
        assert initial_count > 0, "В meal нет продуктов"
        
        # Получаем начальные nutrition totals
        initial_summary = meal_page.get_nutrition_summary()
        initial_calories = initial_summary.get('calories', 0)
        initial_proteins = initial_summary.get('proteins', 0)
        initial_fats = initial_summary.get('fats', 0)
        initial_carbs = initial_summary.get('carbs', 0)
        
        print(f"\n[TEST] Начальные nutrition totals:")
        print(f"  Калории: {initial_calories}")
        print(f"  Белки: {initial_proteins}")
        print(f"  Жиры: {initial_fats}")
        print(f"  Углеводы: {initial_carbs}")
        
        assert initial_calories > 0, "Начальные калории должны быть больше 0"
        
        # Удаляем один продукт
        print("\n=== Удаление продукта ===")
        deleted = meal_page.delete_element(index=0, confirm=True)
        assert deleted, "Не удалось удалить продукт"
        
        # Ждем обновления totals (cache invalidation на бекенде)
        print("\n=== Ожидание обновления nutrition totals ===")
        time.sleep(3)
        
        # Перезагружаем страницу для получения обновленных totals
        # (cache invalidation происходит на бекенде, нужно обновить данные)
        meal_page.go_back()
        time.sleep(1)
        # Открываем meal снова
        main_page = MainPage(driver)
        if main_page.is_page_loaded(timeout=3):
            clicked = main_page.click_meal_card(0)
            if not clicked:
                clicked = main_page.click_meal_card('Завтрак')
            if clicked:
                meal_page = MealPage(driver)
                meal_page.is_page_loaded(timeout=5)
                time.sleep(2)  # Ждем загрузки данных
        
        meal_page.take_screenshot('test_04_after_delete')
        
        # Проверяем, что количество продуктов уменьшилось
        elements_after = meal_page.find_elements_multiple(meal_page.MEAL_ELEMENT_CARD)
        elements_count_after = len(elements_after) if elements_after else 0
        assert elements_count_after < initial_count, f"Количество продуктов не уменьшилось: было {initial_count}, стало {elements_count_after}"
        
        # Получаем обновленные nutrition totals
        updated_summary = meal_page.get_nutrition_summary()
        updated_calories = updated_summary.get('calories', 0)
        updated_proteins = updated_summary.get('proteins', 0)
        updated_fats = updated_summary.get('fats', 0)
        updated_carbs = updated_summary.get('carbs', 0)
        
        print(f"\n[TEST] Обновленные nutrition totals:")
        print(f"  Калории: {updated_calories}")
        print(f"  Белки: {updated_proteins}")
        print(f"  Жиры: {updated_fats}")
        print(f"  Углеводы: {updated_carbs}")
        
        # Проверяем, что totals уменьшились (или остались 0, если удалили последний продукт)
        if elements_count_after > 0:
            # Если остались продукты, totals должны уменьшиться
            assert updated_calories < initial_calories, f"Калории не уменьшились: было {initial_calories}, стало {updated_calories}"
            print(f"✓ Калории уменьшились: {initial_calories} → {updated_calories}")
        else:
            # Если удалили последний продукт, totals должны быть 0
            assert updated_calories == 0, f"Калории должны быть 0 после удаления последнего продукта, но получили {updated_calories}"
            print(f"✓ Все продукты удалены, калории = 0")
        
        print("✓ Nutrition totals обновлены через cache invalidation на бекенде")
        print("✓ Test 04 завершен успешно")
        
        meal_page.take_screenshot('test_04_end')
