"""
Page Object для экрана аккаунта (Account)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class AccountPage(BasePage):
    """Класс для работы с экраном аккаунта"""
    
    # Locators
    ACCOUNT_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Аккаунт' or contains(@text, 'Аккаунт')]"),
    ]
    
    EMAIL_LABEL = [
        (By.XPATH, "//*[@text='Email' or contains(@text, 'Email')]"),
    ]
    
    EMAIL_VALUE = [
        (By.XPATH, "//*[@text='Email']/following-sibling::*[contains(@text, '@')]"),
        (By.XPATH, "//*[contains(@text, '@')]"),
    ]
    
    CREATED_AT_LABEL = [
        (By.XPATH, "//*[@text='Дата создания' or contains(@text, 'Дата создания')]"),
    ]
    
    CREATED_AT_VALUE = [
        (By.XPATH, "//*[@text='Дата создания']/following-sibling::*"),
    ]
    
    OAUTH_PROVIDERS_SECTION = [
        (By.XPATH, "//*[@text='Подключенные аккаунты' or contains(@text, 'Подключенные аккаунты')]"),
    ]
    
    OAUTH_PROVIDER_ITEM = [
        (By.XPATH, "//*[contains(@text, 'Google') or contains(@text, 'Apple')]"),
    ]
    
    EMPTY_OAUTH_TEXT = [
        (By.XPATH, "//*[@text='Нет подключенных OAuth аккаунтов' or contains(@text, 'Нет подключенных')]"),
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    
    LOADING_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'Загрузка информации об аккаунте')]"),
    ]
    
    ERROR_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'Ошибка')]"),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.ACCOUNT_SCREEN_TITLE
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница аккаунта"""
        if timeout is None:
            timeout = 10
        return self.is_displayed_multiple(self.ACCOUNT_SCREEN_TITLE, timeout=timeout)
    
    def get_email(self):
        """Получает email пользователя"""
        try:
            # Ищем значение email рядом с лейблом
            for locator in self.EMAIL_VALUE:
                try:
                    text = self.get_text(locator, timeout=2)
                    if text and '@' in text:
                        return text.strip()
                except:
                    continue
            return None
        except Exception as e:
            print(f"Warning: Could not get email: {e}")
            return None
    
    def get_created_at(self):
        """Получает дату создания аккаунта"""
        try:
            for locator in self.CREATED_AT_VALUE:
                try:
                    text = self.get_text(locator, timeout=2)
                    if text:
                        return text.strip()
                except:
                    continue
            return None
        except Exception as e:
            print(f"Warning: Could not get created at: {e}")
            return None
    
    def has_oauth_providers(self):
        """Проверяет, есть ли подключенные OAuth провайдеры"""
        try:
            # Проверяем наличие секции OAuth
            if not self.is_displayed_multiple(self.OAUTH_PROVIDERS_SECTION, timeout=2):
                return False
            
            # Проверяем, есть ли элементы с провайдерами
            return self.is_displayed_multiple(self.OAUTH_PROVIDER_ITEM, timeout=2)
        except:
            return False
    
    def get_oauth_providers(self):
        """Получает список подключенных OAuth провайдеров"""
        providers = []
        try:
            if self.has_oauth_providers():
                elements = self.find_elements_multiple(self.OAUTH_PROVIDER_ITEM, timeout=2)
                for element in elements:
                    try:
                        text = element.text
                        if 'Google' in text:
                            providers.append('Google')
                        elif 'Apple' in text:
                            providers.append('Apple')
                    except:
                        continue
            return providers
        except Exception as e:
            print(f"Warning: Could not get OAuth providers: {e}")
            return []
    
    def is_loading(self):
        """Проверяет, показывается ли состояние загрузки"""
        try:
            return self.is_displayed_multiple(self.LOADING_MESSAGE, timeout=1)
        except:
            return False
    
    def has_error(self):
        """Проверяет, есть ли ошибка на странице"""
        try:
            return self.is_displayed_multiple(self.ERROR_MESSAGE, timeout=2)
        except:
            return False
    
    def get_error_message(self):
        """Получает текст ошибки"""
        try:
            for locator in self.ERROR_MESSAGE:
                try:
                    text = self.get_text(locator, timeout=2)
                    if text:
                        return text.strip()
                except:
                    continue
            return None
        except:
            return None
    
    def click_back(self):
        """Кликает на кнопку назад"""
        try:
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            self.driver.back()
        time.sleep(2)
        return self
