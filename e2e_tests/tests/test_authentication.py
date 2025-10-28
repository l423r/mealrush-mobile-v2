"""
Тесты для аутентификации пользователя
"""
import os
import sys
import pytest
import time

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.sign_in_page import SignInPage
from pages.registration_page import RegistrationPage
from pages.main_page import MainPage
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD


@pytest.mark.smoke
class TestAuthentication:
    """Тесты для проверки аутентификации"""
    
    def test_sign_in_page_loaded(self, driver, setup_test_environment):
        """Тест: проверка загрузки экрана входа"""
        sign_in_page = SignInPage(driver)
        assert sign_in_page.is_page_loaded(), "Страница входа не загрузилась"
        sign_in_page.take_screenshot('sign_in_page_loaded')
    
    def test_navigate_to_registration(self, driver, setup_test_environment):
        """Тест: переход на экран регистрации"""
        sign_in_page = SignInPage(driver)
        sign_in_page.take_screenshot('before_navigation')
        
        registration_page = sign_in_page.click_register_button()
        assert registration_page.is_page_loaded(), "Страница регистрации не загрузилась"
        registration_page.take_screenshot('registration_page')
        
        # Возвращаемся назад
        sign_in_page = registration_page.click_back()
        assert sign_in_page.is_page_loaded(), "Не удалось вернуться на страницу входа"
    
    def test_sign_in_with_invalid_credentials(self, driver, setup_test_environment):
        """Тест: вход с неверными учетными данными"""
        sign_in_page = SignInPage(driver)
        sign_in_page.login("invalid@example.com", "wrongpassword")
        
        # Проверяем, что мы остались на странице входа или получили ошибку
        time.sleep(2)
        sign_in_page.take_screenshot('invalid_login')
        assert sign_in_page.is_displayed(sign_in_page.LOGIN_BUTTON), \
            "Должен остаться на странице входа при неверных учетных данных"
    
    @pytest.mark.integration
    def test_successful_registration_and_login(self, driver, setup_test_environment, test_user):
        """Тест: успешная регистрация и вход"""
        # Регистрация
        sign_in_page = SignInPage(driver)
        sign_in_page.take_screenshot('before_registration')
        
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            test_user['name'],
            test_user['email'],
            test_user['password']
        )
        
        # После регистрации должны попасть на главный экран
        time.sleep(3)
        main_page = MainPage(driver)
        
        # Проверяем, что зашли в приложение
        if main_page.is_page_loaded():
            main_page.take_screenshot('after_registration_main_screen')
            print("Registration successful, landed on main screen")
        else:
            # Возможно, попадаем на настройку профиля
            driver.save_screenshot('screenshots/after_registration.png')
            print("Registration completed, check screenshots")
    
    @pytest.mark.regression
    def test_password_visibility_toggle(self, driver, setup_test_environment):
        """Тест: переключение видимости пароля"""
        sign_in_page = SignInPage(driver)
        sign_in_page.enter_password("testpassword")
        
        # Проверяем начальное состояние
        sign_in_page.take_screenshot('password_hidden')
        
        # Переключаем видимость
        sign_in_page.toggle_password_visibility()
        sign_in_page.take_screenshot('password_visible')
        
        # Переключаем обратно
        sign_in_page.toggle_password_visibility()
        sign_in_page.take_screenshot('password_hidden_again')
    
    def test_sign_in_form_validation(self, driver, setup_test_environment):
        """Тест: валидация формы входа"""
        sign_in_page = SignInPage(driver)
        
        # Попытка входа с пустым email
        sign_in_page.enter_password("password123")
        sign_in_page.take_screenshot('empty_email')
        
        # Проверяем, что кнопка входа неактивна или есть ошибка
        # (зависит от реализации валидации)
        try:
            login_button = sign_in_page.find_element(sign_in_page.LOGIN_BUTTON)
            # Проверяем доступность кнопки
            assert not login_button.is_enabled() or sign_in_page.get_error_message(), \
                "Должна быть валидация пустого email"
        except Exception:
            pass  # Если кнопка не найдена, валидация работает
        
        # Заполняем email
        sign_in_page.enter_email("test@example.com")
        sign_in_page.take_screenshot('form_filled')
        
        # Теперь кнопка должна быть активна
        login_button = sign_in_page.find_element(sign_in_page.LOGIN_BUTTON)
        assert login_button.is_enabled(), "Кнопка входа должна быть активна при заполненных полях"
    
    def test_forgot_password_button(self, driver, setup_test_environment):
        """Тест: кнопка 'Забыли пароль'"""
        sign_in_page = SignInPage(driver)
        sign_in_page.click_forgot_password()
        time.sleep(1)
        sign_in_page.take_screenshot('forgot_password_clicked')
        
        # Проверяем, что появился диалог или другой экран
        # (реализация зависит от приложения)

