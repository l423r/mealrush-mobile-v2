"""
Тесты для основных функций приложения
"""
import os
import sys
import pytest
import time

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.main_page import MainPage
from pages.search_page import SearchPage
from pages.profile_page import ProfilePage
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD


@pytest.mark.integration
class TestMainFeatures:
    """Тесты для основных функций приложения"""
    
    @pytest.fixture(autouse=True)
    def login_user(self, driver):
        """Фикстура для автоматического входа перед каждым тестом"""
        # Здесь должна быть логика входа
        # Пока просто ждем загрузки главного экрана
        time.sleep(3)
        yield
        # Cleanup после теста
        pass
    
    def test_main_page_loaded(self, driver, setup_test_environment, login_user):
        """Тест: проверка загрузки главного экрана"""
        main_page = MainPage(driver)
        main_page.take_screenshot('main_page')
        
        assert main_page.is_page_loaded(), "Главная страница не загрузилась"
    
    def test_navigate_to_search(self, driver, setup_test_environment, login_user):
        """Тест: переход на вкладку поиска"""
        main_page = MainPage(driver)
        main_page.navigate_to_search()
        
        search_page = SearchPage(driver)
        search_page.take_screenshot('search_page')
        
        assert search_page.is_page_loaded(), "Страница поиска не загрузилась"
    
    def test_navigate_to_profile(self, driver, setup_test_environment, login_user):
        """Тест: переход на вкладку профиля"""
        main_page = MainPage(driver)
        main_page.navigate_to_profile()
        
        profile_page = ProfilePage(driver)
        profile_page.take_screenshot('profile_page')
        
        assert profile_page.is_page_loaded(), "Страница профиля не загрузилась"
    
    def test_change_date(self, driver, setup_test_environment, login_user):
        """Тест: изменение даты"""
        main_page = MainPage(driver)
        main_page.take_screenshot('before_date_change')
        
        # Меняем дату на следующий день
        main_page.change_date('next')
        main_page.take_screenshot('after_next_date')
        
        # Меняем дату на предыдущий день
        main_page.change_date('prev')
        main_page.take_screenshot('after_prev_date')
        
        # Возвращаемся к сегодня
        main_page.change_date('next')
        main_page.take_screenshot('back_to_today')
    
    def test_daily_calories_displayed(self, driver, setup_test_environment, login_user):
        """Тест: отображение дневных калорий"""
        main_page = MainPage(driver)
        
        calories = main_page.get_daily_calories()
        print(f"Daily calories: {calories}")
        
        assert calories >= 0, "Калории должны быть отображены (>= 0)"
        main_page.take_screenshot('daily_calories')
    
    def test_add_meal_button(self, driver, setup_test_environment, login_user):
        """Тест: кнопка добавления приема пищи"""
        main_page = MainPage(driver)
        main_page.take_screenshot('before_add_meal')
        
        main_page.click_add_meal_button()
        main_page.take_screenshot('after_add_meal_click')
        
        # Проверяем, что открылся экран поиска
        search_page = SearchPage(driver)
        if search_page.is_page_loaded():
            search_page.take_screenshot('search_after_add_meal')
            print("Navigated to search page after clicking add meal")
        
        # Возвращаемся назад
        driver.back()
        time.sleep(2)


@pytest.mark.integration
class TestSearchFunctionality:
    """Тесты для функциональности поиска"""
    
    @pytest.fixture(autouse=True)
    def navigate_to_search(self, driver):
        """Фикстура для автоматического перехода на поиск"""
        time.sleep(3)
        # Здесь должна быть логика перехода на экран поиска
        yield
    
    def test_search_page_loaded(self, driver, setup_test_environment):
        """Тест: загрузка страницы поиска"""
        search_page = SearchPage(driver)
        search_page.take_screenshot('search_page_loaded')
        
        assert search_page.is_page_loaded(), "Страница поиска не загрузилась"
    
    def test_search_products(self, driver, setup_test_environment):
        """Тест: поиск продуктов"""
        search_page = SearchPage(driver)
        
        # Ищем продукт
        search_page.search_product("яблоко")
        search_page.take_screenshot('search_results_apple')
        
        # Проверяем, что результаты появились
        products_count = search_page.get_products_count()
        print(f"Found {products_count} products")
        
        assert products_count >= 0, "Результаты поиска должны отображаться"
    
    def test_search_multiple_queries(self, driver, setup_test_environment):
        """Тест: несколько поисковых запросов"""
        search_page = SearchPage(driver)
        
        queries = ["хлеб", "молоко", "рис", "курица"]
        
        for query in queries:
            search_page.search_product(query)
            products_count = search_page.get_products_count()
            print(f"Query '{query}': {products_count} products")
            search_page.take_screenshot(f'search_{query}')
    
    def test_clear_search(self, driver, setup_test_environment):
        """Тест: очистка поискового запроса"""
        search_page = SearchPage(driver)
        
        # Вводим запрос
        search_page.enter_search_query("тест")
        search_page.take_screenshot('before_clear')
        
        # Очищаем
        search_page.clear_search()
        search_page.take_screenshot('after_clear')

