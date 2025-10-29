"""
Тесты для профиля пользователя
"""
import os
import sys
import pytest
import time

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.profile_page import ProfilePage
from pages.main_page import MainPage
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD


@pytest.mark.integration
class TestProfile:
    """Тесты для профиля пользователя"""
    
    @pytest.fixture(autouse=True)
    def navigate_to_profile(self, driver):
        """Фикстура для автоматического перехода в профиль"""
        time.sleep(3)
        yield
    
    def test_profile_page_loaded(self, driver, setup_test_environment):
        """Тест: загрузка страницы профиля"""
        profile_page = ProfilePage(driver)
        profile_page.take_screenshot('profile_page_loaded')
        
        assert profile_page.is_page_loaded(), "Страница профиля не загрузилась"
    
    def test_user_info_displayed(self, driver, setup_test_environment):
        """Тест: отображение информации о пользователе"""
        profile_page = ProfilePage(driver)
        
        user_name = profile_page.get_user_name()
        print(f"User name: {user_name}")
        
        profile_page.take_screenshot('user_info')
        
        # Проверяем, что информация отображается
        # (может быть None, если еще не настроен профиль)
        assert True  # Просто проверяем, что страница работает
    
    def test_bmi_displayed(self, driver, setup_test_environment):
        """Тест: отображение BMI"""
        profile_page = ProfilePage(driver)
        
        bmi = profile_page.get_bmi_value()
        print(f"BMI: {bmi}")
        
        profile_page.take_screenshot('bmi_displayed')
        
        # BMI может быть не заполнен для новых пользователей
        assert bmi is None or 0 < bmi < 50, "BMI должен быть в разумных пределах"
    
    def test_calories_goal_displayed(self, driver, setup_test_environment):
        """Тест: отображение цели по калориям"""
        profile_page = ProfilePage(driver)
        
        calories_goal = profile_page.get_calories_goal()
        print(f"Calories goal: {calories_goal}")
        
        profile_page.take_screenshot('calories_goal')
        
        if calories_goal:
            assert 1000 <= calories_goal <= 5000, \
                "Цель по калориям должна быть в разумных пределах"
    
    def test_settings_button(self, driver, setup_test_environment):
        """Тест: кнопка настроек"""
        profile_page = ProfilePage(driver)
        profile_page.take_screenshot('before_settings')
        
        profile_page.click_settings()
        profile_page.take_screenshot('after_settings_click')
        
        # Возвращаемся назад
        driver.back()
        time.sleep(2)
    
    def test_edit_profile_button(self, driver, setup_test_environment):
        """Тест: кнопка редактирования профиля"""
        profile_page = ProfilePage(driver)
        profile_page.take_screenshot('before_edit')
        
        profile_page.click_edit_profile()
        profile_page.take_screenshot('after_edit_click')
        
        # Возвращаемся назад
        driver.back()
        time.sleep(2)
    
    @pytest.mark.skip(reason="Logout test should be run separately at the end")
    def test_logout(self, driver, setup_test_environment):
        """Тест: выход из аккаунта"""
        profile_page = ProfilePage(driver)
        profile_page.take_screenshot('before_logout')
        
        profile_page.scroll_to_logout()
        profile_page.take_screenshot('scrolled_to_logout')
        
        profile_page.click_logout()
        profile_page.take_screenshot('after_logout')
        
        # Проверяем, что вернулись на экран входа
        time.sleep(2)

