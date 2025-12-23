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
    
    # Locators - используем XPATH так как accessibility ID отсутствуют в SimpleRegistrationScreen
    NAME_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'ваше имя') or contains(@hint, 'Введите ваше имя')]"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваше имя']"),
        (By.XPATH, "//android.widget.EditText[contains(@content-desc, 'name') or contains(@content-desc, 'Name')]")
    ]
    EMAIL_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'ваш email') or contains(@hint, 'Введите ваш email')]"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш email']"),
        (By.XPATH, "//android.widget.EditText[contains(@content-desc, 'email') or contains(@content-desc, 'Email')]")
    ]
    PASSWORD_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Введите пароль') and not(contains(@hint, 'Повторите'))]"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите пароль']"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'пароль') and not(contains(@hint, 'Подтвердите')) and not(contains(@hint, 'Повторите'))]")
    ]
    CONFIRM_PASSWORD_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Повторите пароль') or contains(@hint, 'Подтвердите')]"),
        (By.XPATH, "//android.widget.EditText[@hint='Повторите пароль']"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'подтвердите') or contains(@hint, 'повторите')]")
    ]
    CREATE_ACCOUNT_BUTTON = [
        (By.XPATH, "//android.widget.TextView[@text='Создать аккаунт']/.."),  # Основной - родительский TouchableOpacity
        (By.XPATH, "//*[@text='Создать аккаунт' and @clickable='true']"),  # Кликабельный элемент с текстом
        (By.XPATH, "//*[@text='Создать аккаунт']"),  # Fallback - любой элемент с текстом
        (By.XPATH, "//android.widget.Button[@text='Создать аккаунт']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Создать аккаунт')]")
    ]
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),  # Основной - текст кнопки назад в Header
        (By.XPATH, "//android.widget.TextView[@text='←']/.."),  # TouchableOpacity с текстом
        (By.XPATH, "//android.widget.Button[contains(@content-desc, 'back') or contains(@content-desc, 'Back')]")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.CREATE_ACCOUNT_BUTTON
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница регистрации"""
        # Проверяем наличие кнопки "Создать аккаунт" - основной индикатор страницы
        if timeout is not None:
            return self.is_displayed_multiple(self.CREATE_ACCOUNT_BUTTON, timeout=timeout)
        return self.is_displayed_multiple(self.CREATE_ACCOUNT_BUTTON)
    
    def is_page_loaded_fast(self, timeout=2):
        """Быстрая проверка страницы регистрации с указанным таймаутом"""
        try:
            # Используем только первый локатор для быстрой проверки
            return self.is_displayed(self.CREATE_ACCOUNT_BUTTON[0], timeout=timeout)
        except:
            return False
    
    def enter_name(self, name):
        """Вводит имя"""
        self.send_keys_multiple(self.NAME_INPUT, name)
        return self
    
    def enter_email(self, email):
        """Вводит email"""
        self.send_keys_multiple(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password):
        """Вводит пароль"""
        self.send_keys_multiple(self.PASSWORD_INPUT, password)
        return self
    
    def enter_confirm_password(self, password):
        """Вводит подтверждение пароля"""
        self.send_keys_multiple(self.CONFIRM_PASSWORD_INPUT, password)
        return self
    
    def click_create_account(self):
        """Кликает на кнопку создания аккаунта"""
        # Используем click_multiple, который попробует все локаторы по порядку
        self.click_multiple(self.CREATE_ACCOUNT_BUTTON)
        # Ожидаем перехода на другой экран
        time.sleep(3)
        return self
    
    def click_back(self):
        """Кликает на кнопку назад или использует системную кнопку назад"""
        try:
            # Пытаемся найти и кликнуть кнопку назад в UI
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            # Если кнопка не найдена, используем системную кнопку назад
            self.driver.back()
        time.sleep(2)
        # Возвращаем объект страницы входа
        from pages.sign_in_page import SignInPage
        return SignInPage(self.driver)
    
    def register(self, name, email, password, confirm_password=None):
        """Выполняет полный процесс регистрации
        
        Args:
            name: Имя пользователя
            email: Email пользователя
            password: Пароль
            confirm_password: Подтверждение пароля (если None, используется password)
        """
        self.enter_name(name)
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(confirm_password if confirm_password is not None else password)
        self.click_create_account()
        self.take_screenshot('after_registration')
        return self
    
    def get_error_message(self):
        """Получает сообщение об ошибке, если оно есть"""
        try:
            # Ищем различные варианты сообщений об ошибках
            error_patterns = [
                "//*[contains(@text, 'Ошибка') or contains(@text, 'ошибка')]",
                "//*[contains(@text, 'Error') or contains(@text, 'error')]",
                "//*[contains(@text, 'уже зарегистрирован') or contains(@text, 'already registered')]",
                "//*[contains(@text, 'не совпадают') or contains(@text, 'не совпадают')]",
                "//*[contains(@text, 'должен содержать') or contains(@text, 'must contain')]",
                "//*[contains(@text, 'некорректный') or contains(@text, 'invalid')]"
            ]
            for pattern in error_patterns:
                error_locator = (By.XPATH, pattern)
                error_text = self.get_text(error_locator)
                if error_text:
                    return error_text
            return None
        except Exception:
            return None
    
    def is_error_displayed(self):
        """Проверяет, отображается ли ошибка на странице"""
        return self.get_error_message() is not None
    
    def is_still_on_registration_page(self, timeout=2):
        """Проверяет, остались ли мы на странице регистрации"""
        return self.is_displayed_multiple(self.CREATE_ACCOUNT_BUTTON, timeout=timeout)

