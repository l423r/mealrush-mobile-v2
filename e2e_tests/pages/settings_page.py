"""
Page Object для экрана настроек (Settings)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class SettingsPage(BasePage):
    """Класс для работы с экраном настроек"""
    
    # Locators
    SETTINGS_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Настройки' or contains(@text, 'Настройки')]"),
    ]
    
    COMPLETE_ONBOARDING_OPTION = [
        (By.XPATH, "//*[@text='Завершить настройку профиля' or contains(@text, 'Завершить настройку профиля')]"),
        (By.XPATH, "//*[contains(@text, 'настройку профиля')]")
    ]
    
    ACCOUNT_OPTION = [
        (By.XPATH, "//*[@text='Аккаунт' or contains(@text, 'Аккаунт')]"),
    ]
    
    DELETE_ACCOUNT_OPTION = [
        (By.XPATH, "//*[@text='Удалить аккаунт' or contains(@text, 'Удалить аккаунт')]"),
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница настроек"""
        if timeout is None:
            timeout = 10
        return self.is_displayed_multiple(self.SETTINGS_SCREEN_TITLE, timeout=timeout)
    
    def click_complete_onboarding(self):
        """Кликает на опцию 'Завершить настройку профиля'"""
        self.click_multiple(self.COMPLETE_ONBOARDING_OPTION)
        time.sleep(3)  # Ожидание перехода на экран onboarding
        return self
    
    def has_complete_onboarding_option(self, timeout=3):
        """Проверяет, есть ли опция 'Завершить настройку профиля'"""
        try:
            return self.is_displayed_multiple(self.COMPLETE_ONBOARDING_OPTION, timeout=timeout)
        except:
            return False
    
    def click_account(self):
        """Кликает на опцию 'Аккаунт'"""
        self.click_multiple(self.ACCOUNT_OPTION)
        time.sleep(2)  # Ожидание перехода на экран аккаунта
        return self
    
    def click_delete_account(self):
        """Кликает на опцию 'Удалить аккаунт'"""
        # Прокручиваем до кнопки удаления, если нужно
        self.scroll_to_element(self.DELETE_ACCOUNT_OPTION)
        self.click_multiple(self.DELETE_ACCOUNT_OPTION)
        time.sleep(2)  # Ожидание перехода на экран удаления аккаунта
        return self
    
    def scroll_to_element(self, locators, max_scrolls=5):
        """Прокручивает до элемента, если он не виден"""
        try:
            if self.is_displayed_multiple(locators, timeout=1):
                return
        except:
            pass
        
        # Прокручиваем вниз
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        start_y = size['height'] * 0.7
        end_y = size['height'] * 0.3
        
        for _ in range(max_scrolls):
            try:
                if self.is_displayed_multiple(locators, timeout=0.5):
                    return
            except:
                pass
            self.driver.swipe(start_x, start_y, start_x, end_y, 300)
            time.sleep(0.3)
    
    def click_back(self):
        """Кликает на кнопку назад"""
        try:
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            self.driver.back()
        time.sleep(2)
        return self
