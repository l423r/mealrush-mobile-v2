"""
Page Object для экрана входа (Sign In)
"""
import os
import sys
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class SignInPage(BasePage):
    """Класс для работы с экраном входа"""
    
    # Locators - оптимизированы на основе диагностических тестов
    # AppiumBy.ACCESSIBILITY_ID работает отлично! Используем его как основной способ
    # Убран неработающий By.ID
    
    EMAIL_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_email_input"),  # Основной - работает!
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш email']")  # Fallback
    ]
    
    PASSWORD_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_password_input"),  # Основной - работает!
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш пароль']")  # Fallback
    ]
    
    LOGIN_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_login_button"),  # Основной - работает!
        (By.XPATH, "//*[@text='Войти']")  # Fallback
    ]
    
    REGISTER_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_register_button"),  # Основной
        (By.XPATH, "//*[@text='Зарегистрироваться']")  # Fallback
    ]
    
    FORGOT_PASSWORD_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_forgot_password_button"),  # Основной
        (By.XPATH, "//*[@text='Забыли пароль?']")  # Fallback
    ]
    
    PASSWORD_TOGGLE = [
        (AppiumBy.ACCESSIBILITY_ID, "password_toggle_icon"),  # Основной (будет работать после обновления)
        (By.XPATH, "//*[@text='👁️' or @text='👁️‍🗨️']")  # Fallback - работает!
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.LOGIN_BUTTON
    
    def is_page_loaded(self):
        """Проверяет, загрузилась ли страница входа"""
        return self.is_displayed_multiple(self.LOGIN_BUTTON)
    
    def enter_email(self, email):
        """Вводит email"""
        self.send_keys_multiple(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password):
        """Вводит пароль"""
        self.send_keys_multiple(self.PASSWORD_INPUT, password)
        return self
    
    def toggle_password_visibility(self):
        """Переключает видимость пароля"""
        self.click_multiple(self.PASSWORD_TOGGLE)
        return self
    
    def click_login_button(self):
        """Кликает на кнопку входа"""
        self.click_multiple(self.LOGIN_BUTTON)
        # Ожидаем перехода на другой экран
        time.sleep(2)
        return self
    
    def click_register_button(self):
        """Кликает на кнопку регистрации"""
        self.click_multiple(self.REGISTER_BUTTON)
        time.sleep(2)
        # Возвращаем объект страницы регистрации
        from pages.registration_page import RegistrationPage
        return RegistrationPage(self.driver)
    
    def click_forgot_password(self):
        """Кликает на кнопку 'Забыли пароль'"""
        self.click_multiple(self.FORGOT_PASSWORD_BUTTON)
        return self
    
    def login(self, email, password):
        """Выполняет полный процесс входа"""
        self.enter_email(email)
        self.enter_password(password)
        self.click_login_button()
        self.take_screenshot('after_login')
        return self
    
    def get_error_message(self):
        """Получает сообщение об ошибке, если оно есть"""
        try:
            error_locator = (By.XPATH, "//*[contains(@text, 'Ошибка') or contains(@text, 'ошибка')]")
            return self.get_text(error_locator)
        except Exception:
            return None

