"""
Page Object для экранов сброса пароля
"""
import os
import sys
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class PasswordResetRequestPage(BasePage):
    """Класс для работы с экраном запроса сброса пароля"""
    
    # Locators
    EMAIL_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "password_reset_request_email_input"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш email']"),
    ]
    
    SUBMIT_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "password_reset_request_submit_button"),
        (By.XPATH, "//*[@text='Отправить']"),
    ]
    
    SUCCESS_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'Запрос отправлен')]"),
        (By.XPATH, "//*[contains(@text, 'ссылка для сброса пароля отправлена')]"),
    ]
    
    SUCCESS_TITLE = [
        (By.XPATH, "//*[@text='Запрос отправлен']"),
        (By.XPATH, "//*[contains(@text, 'Запрос отправлен')]"),
    ]
    
    BACK_TO_SIGN_IN_BUTTON = [
        (By.XPATH, "//*[@text='Вернуться к входу']"),
        (By.XPATH, "//*[contains(@text, 'Вернуться к входу')]"),
    ]
    
    ERROR_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'Ошибка')]"),
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/.."),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.SUBMIT_BUTTON
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница запроса сброса пароля"""
        if timeout is not None:
            return self.is_displayed_multiple(self.SUBMIT_BUTTON, timeout=timeout)
        return self.is_displayed_multiple(self.SUBMIT_BUTTON)
    
    def enter_email(self, email):
        """Вводит email"""
        self.send_keys_multiple(self.EMAIL_INPUT, email)
        return self
    
    def click_submit(self):
        """Кликает на кнопку отправки"""
        self.click_multiple(self.SUBMIT_BUTTON)
        time.sleep(1)  # Ожидание обработки запроса
        return self
    
    def is_success_message_displayed(self, timeout=5):
        """Проверяет, отображается ли сообщение об успехе"""
        return self.is_displayed_multiple(self.SUCCESS_MESSAGE, timeout=timeout)
    
    def is_success_screen_displayed(self, timeout=5):
        """Проверяет, отображается ли экран успеха с заголовком 'Запрос отправлен' или кнопкой 'Вернуться к входу'"""
        # Проверяем наличие заголовка "Запрос отправлен"
        if self.is_displayed_multiple(self.SUCCESS_TITLE, timeout=2):
            return True
        # Проверяем наличие кнопки "Вернуться к входу"
        return self.is_displayed_multiple(self.BACK_TO_SIGN_IN_BUTTON, timeout=timeout)
    
    def get_error_message(self):
        """Получает сообщение об ошибке (если есть)"""
        try:
            return self.get_text_multiple(self.ERROR_MESSAGE)
        except:
            return None
    
    def click_back(self):
        """Кликает на кнопку назад или 'Вернуться к входу' (на экране успеха)"""
        # Пробуем кнопку "Вернуться к входу" на экране успеха
        try:
            self.click_multiple(self.BACK_TO_SIGN_IN_BUTTON, timeout=2)
            time.sleep(0.5)
            return self
        except:
            # Fallback на обычную кнопку назад
            self.click_multiple(self.BACK_BUTTON)
            time.sleep(0.5)
            return self


class PasswordResetPage(BasePage):
    """Класс для работы с экраном сброса пароля (завершение)"""
    
    # Locators
    PASSWORD_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "password_reset_password_input"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите новый пароль']"),
    ]
    
    CONFIRM_PASSWORD_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "password_reset_confirm_password_input"),
        (By.XPATH, "//android.widget.EditText[@hint='Повторите новый пароль']"),
    ]
    
    SUBMIT_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "password_reset_submit_button"),
        (By.XPATH, "//*[@text='Изменить пароль']"),
    ]
    
    SUCCESS_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'успешно')]"),
    ]
    
    ERROR_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'недействителен') or contains(@text, 'истек')]"),
        (By.XPATH, "//*[contains(@text, 'Ошибка')]"),
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/.."),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.SUBMIT_BUTTON
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница сброса пароля"""
        if timeout is not None:
            return self.is_displayed_multiple(self.SUBMIT_BUTTON, timeout=timeout)
        return self.is_displayed_multiple(self.SUBMIT_BUTTON)
    
    def enter_password(self, password):
        """Вводит новый пароль"""
        self.send_keys_multiple(self.PASSWORD_INPUT, password)
        return self
    
    def enter_confirm_password(self, password):
        """Вводит подтверждение пароля"""
        self.send_keys_multiple(self.CONFIRM_PASSWORD_INPUT, password)
        return self
    
    def click_submit(self):
        """Кликает на кнопку изменения пароля"""
        self.click_multiple(self.SUBMIT_BUTTON)
        time.sleep(2)  # Ожидание обработки сброса пароля
        return self
    
    def is_success_message_displayed(self, timeout=5):
        """Проверяет, отображается ли сообщение об успехе"""
        return self.is_displayed_multiple(self.SUCCESS_MESSAGE, timeout=timeout)
    
    def get_error_message(self):
        """Получает сообщение об ошибке (если есть)"""
        try:
            return self.get_text_multiple(self.ERROR_MESSAGE)
        except:
            return None
    
    def click_back(self):
        """Кликает на кнопку назад"""
        self.click_multiple(self.BACK_BUTTON)
        time.sleep(0.5)
        return self
