"""
Page Object для экрана регистрации
"""
import os
import sys
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class RegistrationPage(BasePage):
    """Класс для работы с экраном регистрации"""
    
    # Locators
    NAME_INPUT = (By.XPATH, "//android.widget.EditText[contains(@hint, 'Имя') or contains(@content-desc, 'Name')]")
    EMAIL_INPUT = (By.XPATH, "//android.widget.EditText[contains(@hint, 'email') or contains(@content-desc, 'Email')]")
    PASSWORD_INPUT = (By.XPATH, "//android.widget.EditText[contains(@hint, 'пароль') and not(contains(@hint, 'Подтвердите'))]")
    CONFIRM_PASSWORD_INPUT = (By.XPATH, "//android.widget.EditText[contains(@hint, 'Подтвердите') or contains(@hint, 'Повторите')]")
    CREATE_ACCOUNT_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Создать аккаунт') or contains(@text, 'Зарегистрироваться')]")
    BACK_BUTTON = (By.XPATH, "//android.widget.Button[contains(@content-desc, 'back') or contains(@content-desc, 'Back')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.CREATE_ACCOUNT_BUTTON
    
    def is_page_loaded(self):
        """Проверяет, загрузилась ли страница регистрации"""
        return self.is_displayed(self.CREATE_ACCOUNT_BUTTON)
    
    def enter_name(self, name):
        """Вводит имя"""
        self.send_keys(self.NAME_INPUT, name)
        return self
    
    def enter_email(self, email):
        """Вводит email"""
        self.send_keys(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password):
        """Вводит пароль"""
        self.send_keys(self.PASSWORD_INPUT, password)
        return self
    
    def enter_confirm_password(self, password):
        """Вводит подтверждение пароля"""
        self.send_keys(self.CONFIRM_PASSWORD_INPUT, password)
        return self
    
    def click_create_account(self):
        """Кликает на кнопку создания аккаунта"""
        self.click(self.CREATE_ACCOUNT_BUTTON)
        # Ожидаем перехода на другой экран
        time.sleep(3)
        return self
    
    def click_back(self):
        """Кликает на кнопку назад"""
        self.click(self.BACK_BUTTON)
        time.sleep(2)
        # Возвращаем объект страницы входа
        from pages.sign_in_page import SignInPage
        return SignInPage(self.driver)
    
    def register(self, name, email, password):
        """Выполняет полный процесс регистрации"""
        self.enter_name(name)
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(password)
        self.click_create_account()
        self.take_screenshot('after_registration')
        return self
    
    def get_error_message(self):
        """Получает сообщение об ошибке, если оно есть"""
        try:
            error_locator = (By.XPATH, "//*[contains(@text, 'Ошибка') or contains(@text, 'ошибка')]")
            return self.get_text(error_locator)
        except Exception:
            return None

