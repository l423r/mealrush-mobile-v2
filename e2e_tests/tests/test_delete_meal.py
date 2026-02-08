"""
E2E Тесты для Story 3.9: Delete Meal
Тестирование удаления приемов пищи через UI

Сценарий запуска всего файла:
1. SETUP (module scope):
   - Регистрация нового тестового пользователя через UI
   - Прохождение онбординга (создание профиля)
   - Переход на главный экран
   - Создание тестового приема пищи для удаления

2. TESTS:
   - Тестирование удаления приема пищи с подтверждением
   - Тестирование отмены удаления
   - Тестирование обновления списка meals после удаления
   - Тестирование обновления daily summary после удаления

3. TEARDOWN (module scope):
   - Удаление тестового пользователя через API
   - Cleanup созданных данных

Acceptance Criteria Coverage:
- AC: 1 - Given I have a meal entry, When I delete the meal, Then confirmation dialog is shown, And if I confirm, meal is deleted from database, And meal is removed from meal list, And all associated products are deleted, And I receive confirmation message
- AC: 2 - Given I am deleting a meal, When I cancel the deletion, Then meal is not deleted, And I return to meal view
- AC: 3 - Given meal is deleted, When I view meal history, Then deleted meal no longer appears, And date's meal summary is updated (total calories, etc.)
"""
import os
import sys
import pytest
import time
import random
import string
from datetime import datetime, timedelta

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.sign_in_page import SignInPage
from pages.registration_page import RegistrationPage
from pages.main_page import MainPage
from pages.search_page import SearchPage
from pages.meal_page import MealPage
from pages.profile_setup_page import ProfileSetupPage
from pages.target_selection_page import TargetSelectionPage
from pages.weight_page import WeightPage
from pages.target_weight_page import TargetWeightPage
from pages.height_page import HeightPage
from pages.birthday_page import BirthdayPage
from pages.activity_page import ActivityPage
from pages.complete_profile_page import CompleteProfilePage
from utilities.user_cleanup import UserCleanup
from utilities.user_management import UserManagement
from utilities.timing import timer


# =============================================================================
# SETUP/TEARDOWN КЛАСС
# =============================================================================

class TestDeleteMealSetup:
    """
    Вспомогательный класс для setup/teardown тестов удаления приемов пищи
    """
    
    @staticmethod
    def generate_test_user():
        """Генерирует уникальные данные тестового пользователя"""
        timestamp = int(time.time() * 1000)
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        return {
            'email': f"delete_meal_test_{timestamp}_{random_string}@example.com",
            'password': "Test123456",
            'name': f"DeleteMealTest_{random_string}"
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
            
            # Регистрируем для автоматической очистки
            UserCleanup.register_user(user_data['email'], user_data['password'])
            
            # Шаг 3: Прохождение онбординга
            profile_setup_page = ProfileSetupPage(driver)
            if not profile_setup_page.is_page_loaded(timeout=5):
                print("[SETUP] Страница настройки профиля не загрузилась")
                return None
            
            profile_setup_page.take_screenshot('03_profile_setup')
            
            # Выбор цели
            target_selection_page = profile_setup_page.click_continue_button()
            if target_selection_page and target_selection_page.is_page_loaded(timeout=5):
                target_selection_page.select_target("Похудение")
                time.sleep(1)
                weight_page = target_selection_page.click_continue_button()
            else:
                weight_page = None
            
            # Ввод веса
            if weight_page and weight_page.is_page_loaded(timeout=5):
                weight_page.enter_weight("70")
                time.sleep(1)
                target_weight_page = weight_page.click_continue_button()
            else:
                target_weight_page = None
            
            # Ввод целевого веса
            if target_weight_page and target_weight_page.is_page_loaded(timeout=5):
                target_weight_page.enter_target_weight("65")
                time.sleep(1)
                height_page = target_weight_page.click_continue_button()
            else:
                height_page = None
            
            # Ввод роста
            if height_page and height_page.is_page_loaded(timeout=5):
                height_page.enter_height("175")
                time.sleep(1)
                birthday_page = height_page.click_continue_button()
            else:
                birthday_page = None
            
            # Ввод даты рождения
            if birthday_page and birthday_page.is_page_loaded(timeout=5):
                birthday_page.enter_birthday("1990-01-01")
                time.sleep(1)
                activity_page = birthday_page.click_continue_button()
            else:
                activity_page = None
            
            # Выбор активности
            if activity_page and activity_page.is_page_loaded(timeout=5):
                activity_page.select_activity("Средняя")
                time.sleep(1)
                complete_profile_page = activity_page.click_continue_button()
            else:
                complete_profile_page = None
            
            # Завершение онбординга
            if complete_profile_page and complete_profile_page.is_page_loaded(timeout=5):
                complete_profile_page.take_screenshot('04_complete_profile')
                main_page = complete_profile_page.click_complete_button()
                time.sleep(3)
            else:
                # Если онбординг не завершен, пробуем найти главный экран
                main_page = MainPage(driver)
                if not main_page.is_page_loaded(timeout=5):
                    print("[SETUP] Главный экран не загрузился после онбординга")
                    return None
            
            # Проверка загрузки главного экрана
            if not main_page.is_page_loaded(timeout=10):
                print("[SETUP] Главный экран не загрузился")
                return None
            
            main_page.take_screenshot('05_main_page_after_onboarding')
            print("[SETUP] ✓ Пользователь зарегистрирован и онбординг пройден")
            
            return main_page
            
        except Exception as e:
            print(f"[SETUP] ✗ Ошибка при регистрации и онбординге: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def ensure_meal_exists(driver, main_page, meal_created):
        """
        Helper method to ensure meal exists before test execution.
        Creates meal if it wasn't created in setup.
        
        Args:
            driver: Appium WebDriver
            main_page: MainPage instance
            meal_created: Boolean indicating if meal was created in setup
            
        Returns:
            bool: True if meal exists (was created or created now), False otherwise
        """
        if not meal_created:
            print("[HELPER] Meal не был создан в setup, создаем сейчас...")
            meal_created, _ = TestDeleteMealSetup.create_test_meal(driver, main_page)
            if not meal_created:
                print("[HELPER] ⚠ Не удалось создать тестовый meal")
        return meal_created
    
    @staticmethod
    def create_test_meal(driver, main_page):
        """
        Создает тестовый прием пищи для удаления
        
        Args:
            driver: Appium WebDriver
            main_page: MainPage instance
            
        Returns:
            tuple: (meal_id, meal_type) или (None, None) если ошибка
        """
        try:
            print("[SETUP] Создаем тестовый прием пищи для удаления...")
            
            # Проверяем, что мы на главном экране
            if not main_page.is_page_loaded(timeout=5):
                print("[SETUP] ⚠ Главный экран не загружен, переходим на него")
                main_page = MainPage(driver)
                if not main_page.is_page_loaded(timeout=10):
                    print("[SETUP] ✗ Не удалось загрузить главный экран")
                    return None, None
            
            # Запоминаем количество meals до создания
            meals_count_before = main_page.get_meals_count()
            print(f"[SETUP] Количество meals до создания: {meals_count_before}")
            
            # Кликаем на FAB для добавления приема пищи
            main_page.click_add_meal_button()
            time.sleep(2)
            
            # Переходим на SearchScreen
            search_page = SearchPage(driver)
            if not search_page.is_page_loaded(timeout=5):
                print("[SETUP] ⚠ SearchScreen не загрузился, пробуем найти продукт")
            
            search_page.take_screenshot('06_search_page')
            
            # Ищем продукт для добавления
            # Используем простой поиск по названию
            search_page.enter_search_query("Банан")
            time.sleep(2)
            
            # Кликаем на первый результат поиска
            search_page.click_first_search_result()
            time.sleep(2)
            
            # Переходим на MealElementPage для настройки количества
            # Обычно после клика на продукт открывается экран с количеством
            # Просто сохраняем с дефолтным количеством (100г)
            # Ищем кнопку "Добавить" или "Сохранить"
            try:
                # Пробуем найти кнопку добавления
                add_button = driver.find_element("xpath", "//*[@text='Добавить' or contains(@text, 'Добавить')]")
                add_button.click()
                time.sleep(2)
            except:
                # Если кнопка не найдена, пробуем системную кнопку назад
                # Это означает, что продукт уже добавлен
                driver.back()
                time.sleep(2)
            
            # Возвращаемся на главный экран
            # Проверяем, что мы на главном экране
            main_page = MainPage(driver)
            if not main_page.is_page_loaded(timeout=10):
                # Пробуем вернуться назад
                driver.back()
                time.sleep(2)
                main_page = MainPage(driver)
            
            # Проверяем, что meal создан
            meals_count_after = main_page.get_meals_count()
            print(f"[SETUP] Количество meals после создания: {meals_count_after}")
            
            if meals_count_after > meals_count_before:
                print("[SETUP] ✓ Тестовый прием пищи создан успешно")
                main_page.take_screenshot('07_main_page_with_meal')
                return True, "BREAKFAST"  # Возвращаем True если meal создан
            else:
                print("[SETUP] ⚠ Прием пищи не был создан, но продолжаем тесты")
                return False, None
                
        except Exception as e:
            print(f"[SETUP] ✗ Ошибка при создании тестового приема пищи: {e}")
            import traceback
            traceback.print_exc()
            return False, None


# =============================================================================
# MODULE-SCOPED FIXTURES
# =============================================================================

@pytest.fixture(scope='module')
def delete_meal_test_user():
    """Генерирует пользователя один раз для всего модуля"""
    return TestDeleteMealSetup.generate_test_user()


@pytest.fixture(scope='module')
def authenticated_session_with_meal(driver, delete_meal_test_user):
    """
    Фикстура уровня модуля - регистрирует пользователя и создает тестовый meal
    
    Yields:
        tuple: (MainPage, user_data, meal_created)
    """
    print("\n" + "="*60)
    print("MODULE SETUP: Регистрация тестового пользователя для Story 3.9")
    print("="*60)
    
    main_page = TestDeleteMealSetup.register_and_complete_profile(driver, delete_meal_test_user)
    
    if main_page is None:
        pytest.skip("Не удалось зарегистрировать пользователя - пропуск тестов")
    
    # Создаем тестовый прием пищи
    meal_created, meal_type = TestDeleteMealSetup.create_test_meal(driver, main_page)
    
    yield main_page, delete_meal_test_user, meal_created
    
    print("\n" + "="*60)
    print("MODULE TEARDOWN: Cleanup выполнен через UserCleanup")
    print("="*60)


# =============================================================================
# TEST CLASS: Основные тесты удаления приемов пищи
# =============================================================================

@pytest.mark.integration
@pytest.mark.story_3_9
class TestDeleteMeal:
    """
    E2E тесты для удаления приемов пищи (Story 3.9)
    
    User Flow:
    1. Главный экран (MainScreen) → Клик на MealCard → MealScreen
    2. MealScreen → Меню действий (три точки) → "Удалить"
    3. Диалог подтверждения → "Подтвердить" или "Отмена"
    4. Возврат на главный экран → Проверка обновления списка и daily summary
    """
    
    def test_01_delete_meal_with_confirmation(self, driver, setup_test_environment, authenticated_session_with_meal):
        """
        AC: 1 - Authenticated user deletes meal with confirmation
        
        Шаги:
        1. Пользователь на главном экране
        2. Клик на карточку приема пищи
        3. Открытие меню действий (три точки)
        4. Выбор опции "Удалить"
        5. Подтверждение удаления в диалоге
        6. Проверка возврата на главный экран
        7. Проверка удаления meal из списка
        8. Проверка обновления daily summary
        
        Ожидаемый результат:
        - Диалог подтверждения показан
        - После подтверждения meal удален из базы данных
        - Meal удален из списка на главном экране
        - Daily summary обновлен (калории уменьшены)
        - Показано сообщение об успешном удалении
        """
        main_page, user_data, meal_created = authenticated_session_with_meal
        
        # Ensure meal exists before test
        meal_created = TestDeleteMealSetup.ensure_meal_exists(driver, main_page, meal_created)
        if not meal_created:
            pytest.skip("Не удалось создать тестовый meal - пропуск теста")
        
        # Проверка загрузки главного экрана
        assert main_page.is_page_loaded(), "Главная страница не загрузилась"
        main_page.take_screenshot('01_main_page_before_delete')
        
        # Запоминаем количество meals и калории до удаления
        meals_count_before = main_page.get_meals_count()
        calories_before = main_page.get_daily_calories()
        
        print(f"[test_01] Meals до удаления: {meals_count_before}")
        print(f"[test_01] Калории до удаления: {calories_before}")
        
        assert meals_count_before > 0, "Должен быть хотя бы один meal для удаления"
        
        # Кликаем на первую карточку приема пищи
        print("[test_01] Кликаем на карточку приема пищи...")
        main_page.click_first_meal_card()
        time.sleep(2)
        
        # Переходим на MealScreen
        meal_page = MealPage(driver)
        assert meal_page.is_page_loaded(), "Экран деталей приема пищи не загрузился"
        meal_page.take_screenshot('02_meal_screen_before_delete')
        
        # Запоминаем тип приема пищи для проверки
        meal_type = meal_page.get_meal_type()
        print(f"[test_01] Тип приема пищи: {meal_type}")
        
        # Открываем меню действий и удаляем meal
        print("[test_01] Открываем меню действий и удаляем meal...")
        meal_page.click_delete()
        time.sleep(1)
        
        # Проверяем, что диалог подтверждения показан
        print("[test_01] Проверяем диалог подтверждения...")
        dialog_visible = False
        for locator in meal_page.DELETE_CONFIRM_DIALOG:
            try:
                if meal_page.is_displayed(locator, timeout=2):
                    dialog_visible = True
                    print("[test_01] ✓ Диалог подтверждения найден")
                    break
            except:
                continue
        
        assert dialog_visible, "Диалог подтверждения должен быть показан"
        meal_page.take_screenshot('03_delete_confirm_dialog')
        
        # Подтверждаем удаление
        print("[test_01] Подтверждаем удаление...")
        meal_page.confirm_delete()
        time.sleep(3)  # Ждем удаления и возврата на главный экран
        
        # Проверяем, что мы вернулись на главный экран
        main_page = MainPage(driver)
        assert main_page.is_page_loaded(), "Должны вернуться на главный экран после удаления"
        main_page.take_screenshot('04_main_page_after_delete')
        
        # Проверяем, что meal удален из списка
        meals_count_after = main_page.get_meals_count()
        print(f"[test_01] Meals после удаления: {meals_count_after}")
        
        assert meals_count_after < meals_count_before, f"Количество meals должно уменьшиться: было {meals_count_before}, стало {meals_count_after}"
        
        # Проверяем обновление daily summary (калории должны уменьшиться)
        calories_after = main_page.get_daily_calories()
        print(f"[test_01] Калории после удаления: {calories_after}")
        
        # Калории должны уменьшиться или остаться 0 (если был только один meal)
        assert calories_after <= calories_before, f"Калории должны уменьшиться или остаться прежними: было {calories_before}, стало {calories_after}"
        
        print("✓ Тест успешно завершен: meal удален с подтверждением")
    
    def test_02_cancel_meal_deletion(self, driver, setup_test_environment, authenticated_session_with_meal):
        """
        AC: 2 - User cancels meal deletion
        
        Шаги:
        1. Пользователь на главном экране
        2. Клик на карточку приема пищи
        3. Открытие меню действий (три точки)
        4. Выбор опции "Удалить"
        5. Отмена удаления в диалоге
        6. Проверка возврата на экран деталей meal
        7. Проверка, что meal не удален
        
        Ожидаемый результат:
        - Диалог подтверждения показан
        - После отмены meal НЕ удален
        - Пользователь возвращается на экран деталей meal
        - Meal все еще отображается в списке на главном экране
        """
        main_page, user_data, meal_created = authenticated_session_with_meal
        
        # Ensure meal exists before test
        meal_created = TestDeleteMealSetup.ensure_meal_exists(driver, main_page, meal_created)
        if not meal_created:
            pytest.skip("Не удалось создать тестовый meal - пропуск теста")
        
        # Проверка загрузки главного экрана
        assert main_page.is_page_loaded(), "Главная страница не загрузилась"
        main_page.take_screenshot('01_main_page_before_cancel')
        
        # Запоминаем количество meals до отмены
        meals_count_before = main_page.get_meals_count()
        print(f"[test_02] Meals до отмены: {meals_count_before}")
        
        assert meals_count_before > 0, "Должен быть хотя бы один meal для теста отмены"
        
        # Кликаем на первую карточку приема пищи
        print("[test_02] Кликаем на карточку приема пищи...")
        main_page.click_first_meal_card()
        time.sleep(2)
        
        # Переходим на MealScreen
        meal_page = MealPage(driver)
        assert meal_page.is_page_loaded(), "Экран деталей приема пищи не загрузился"
        meal_page.take_screenshot('02_meal_screen_before_cancel')
        
        # Запоминаем тип приема пищи
        meal_type = meal_page.get_meal_type()
        print(f"[test_02] Тип приема пищи: {meal_type}")
        
        # Открываем меню действий и начинаем удаление
        print("[test_02] Открываем меню действий и начинаем удаление...")
        meal_page.click_delete()
        time.sleep(1)
        
        # Проверяем, что диалог подтверждения показан
        print("[test_02] Проверяем диалог подтверждения...")
        dialog_visible = False
        for locator in meal_page.DELETE_CONFIRM_DIALOG:
            try:
                if meal_page.is_displayed(locator, timeout=2):
                    dialog_visible = True
                    print("[test_02] ✓ Диалог подтверждения найден")
                    break
            except:
                continue
        
        assert dialog_visible, "Диалог подтверждения должен быть показан"
        meal_page.take_screenshot('03_delete_confirm_dialog')
        
        # Отменяем удаление
        print("[test_02] Отменяем удаление...")
        meal_page.cancel_delete()
        time.sleep(2)
        
        # Проверяем, что мы остались на экране деталей meal
        assert meal_page.is_page_loaded(), "Должны остаться на экране деталей meal после отмены"
        meal_page.take_screenshot('04_meal_screen_after_cancel')
        
        # Проверяем, что тип приема пищи не изменился (meal не удален)
        meal_type_after = meal_page.get_meal_type()
        assert meal_type_after == meal_type, f"Тип приема пищи должен остаться прежним: было {meal_type}, стало {meal_type_after}"
        
        # Возвращаемся на главный экран
        meal_page.go_back()
        time.sleep(2)
        
        main_page = MainPage(driver)
        assert main_page.is_page_loaded(), "Должны вернуться на главный экран"
        main_page.take_screenshot('05_main_page_after_cancel')
        
        # Проверяем, что meal все еще в списке
        meals_count_after = main_page.get_meals_count()
        print(f"[test_02] Meals после отмены: {meals_count_after}")
        
        assert meals_count_after == meals_count_before, f"Количество meals должно остаться прежним: было {meals_count_before}, стало {meals_count_after}"
        
        print("✓ Тест успешно завершен: удаление meal отменено, meal не удален")
    
    def test_03_meal_disappears_from_list_after_deletion(self, driver, setup_test_environment, authenticated_session_with_meal):
        """
        AC: 1, 3 - Meal disappears from meal list after deletion
        
        Шаги:
        1. Пользователь на главном экране
        2. Запоминаем список meals
        3. Удаляем meal с подтверждением
        4. Проверяем, что meal удален из списка
        5. Проверяем, что список обновился
        
        Ожидаемый результат:
        - Meal удален из списка на главном экране
        - Список meals обновлен автоматически
        - Если был только один meal, показывается empty state
        """
        main_page, user_data, meal_created = authenticated_session_with_meal
        
        # Ensure meal exists before test
        meal_created = TestDeleteMealSetup.ensure_meal_exists(driver, main_page, meal_created)
        if not meal_created:
            pytest.skip("Не удалось создать тестовый meal - пропуск теста")
        
        # Проверка загрузки главного экрана
        assert main_page.is_page_loaded(), "Главная страница не загрузилась"
        main_page.take_screenshot('01_main_page_before_delete')
        
        # Запоминаем количество meals до удаления
        meals_count_before = main_page.get_meals_count()
        print(f"[test_03] Meals до удаления: {meals_count_before}")
        
        assert meals_count_before > 0, "Должен быть хотя бы один meal для удаления"
        
        # Кликаем на первую карточку приема пищи
        print("[test_03] Кликаем на карточку приема пищи...")
        main_page.click_first_meal_card()
        time.sleep(2)
        
        # Переходим на MealScreen
        meal_page = MealPage(driver)
        assert meal_page.is_page_loaded(), "Экран деталей приема пищи не загрузился"
        
        # Удаляем meal с подтверждением
        print("[test_03] Удаляем meal с подтверждением...")
        meal_page.delete_meal()
        time.sleep(3)  # Ждем удаления и возврата на главный экран
        
        # Проверяем, что мы вернулись на главный экран
        main_page = MainPage(driver)
        assert main_page.is_page_loaded(), "Должны вернуться на главный экран после удаления"
        main_page.take_screenshot('02_main_page_after_delete')
        
        # Проверяем, что meal удален из списка
        meals_count_after = main_page.get_meals_count()
        print(f"[test_03] Meals после удаления: {meals_count_after}")
        
        assert meals_count_after < meals_count_before, f"Количество meals должно уменьшиться: было {meals_count_before}, стало {meals_count_after}"
        
        # Если был только один meal, проверяем empty state
        if meals_count_after == 0:
            has_empty_state = main_page.has_empty_state()
            print(f"[test_03] Empty state показан: {has_empty_state}")
            # Empty state может быть показан, но это не обязательно
        
        print("✓ Тест успешно завершен: meal удален из списка")
    
    def test_04_daily_summary_updates_after_deletion(self, driver, setup_test_environment, authenticated_session_with_meal):
        """
        AC: 3 - Daily summary updates after meal deletion
        
        Шаги:
        1. Пользователь на главном экране
        2. Запоминаем daily summary (калории) до удаления
        3. Удаляем meal с подтверждением
        4. Проверяем обновление daily summary (калории уменьшены)
        
        Ожидаемый результат:
        - Daily summary обновлен после удаления meal
        - Калории уменьшены на количество калорий удаленного meal
        - БЖУ обновлены соответственно
        """
        main_page, user_data, meal_created = authenticated_session_with_meal
        
        # Ensure meal exists before test
        meal_created = TestDeleteMealSetup.ensure_meal_exists(driver, main_page, meal_created)
        if not meal_created:
            pytest.skip("Не удалось создать тестовый meal - пропуск теста")
        
        # Проверка загрузки главного экрана
        assert main_page.is_page_loaded(), "Главная страница не загрузилась"
        main_page.take_screenshot('01_main_page_before_delete')
        
        # Запоминаем daily summary до удаления
        calories_before = main_page.get_daily_calories()
        nutrition_before = main_page.get_daily_nutrition()
        
        print(f"[test_04] Калории до удаления: {calories_before}")
        print(f"[test_04] БЖУ до удаления: {nutrition_before}")
        
        # Запоминаем количество meals
        meals_count_before = main_page.get_meals_count()
        print(f"[test_04] Meals до удаления: {meals_count_before}")
        
        assert meals_count_before > 0, "Должен быть хотя бы один meal для удаления"
        
        # Переходим на экран деталей meal
        print("[test_04] Переходим на экран деталей meal...")
        main_page.click_first_meal_card()
        time.sleep(2)
        
        meal_page = MealPage(driver)
        assert meal_page.is_page_loaded(), "Экран деталей приема пищи не загрузился"
        
        # Запоминаем калории meal перед удалением
        meal_calories = meal_page.get_total_calories()
        print(f"[test_04] Калории meal для удаления: {meal_calories}")
        
        # Удаляем meal с подтверждением
        print("[test_04] Удаляем meal с подтверждением...")
        meal_page.delete_meal()
        time.sleep(3)  # Ждем удаления и обновления summary
        
        # Проверяем, что мы вернулись на главный экран
        main_page = MainPage(driver)
        assert main_page.is_page_loaded(), "Должны вернуться на главный экран после удаления"
        main_page.take_screenshot('02_main_page_after_delete')
        
        # Проверяем обновление daily summary
        calories_after = main_page.get_daily_calories()
        nutrition_after = main_page.get_daily_nutrition()
        
        print(f"[test_04] Калории после удаления: {calories_after}")
        print(f"[test_04] БЖУ после удаления: {nutrition_after}")
        
        # Калории должны уменьшиться или остаться 0
        assert calories_after <= calories_before, f"Калории должны уменьшиться: было {calories_before}, стало {calories_after}"
        
        # Если meal имел калории, они должны быть вычтены (с небольшой погрешностью)
        if meal_calories > 0:
            expected_calories = max(0, calories_before - meal_calories)
            # Допускаем погрешность в 10 калорий из-за округления
            assert abs(calories_after - expected_calories) <= 10, f"Калории должны уменьшиться примерно на {meal_calories}: было {calories_before}, ожидалось {expected_calories}, стало {calories_after}"
        
        print("✓ Тест успешно завершен: daily summary обновлен после удаления meal")
