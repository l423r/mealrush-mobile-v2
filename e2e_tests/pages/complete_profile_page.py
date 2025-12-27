"""
Page Object для экрана завершения настройки профиля (CompleteProfile)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class CompleteProfilePage(BasePage):
    """Класс для работы с экраном завершения настройки профиля"""
    
    # Locators
    COMPLETE_PROFILE_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Завершение настройки' or contains(@text, 'Завершение настройки')]"),
        (By.XPATH, "//*[contains(@text, 'Почти готово')]")
    ]
    
    COMPLETE_BUTTON = [
        (By.XPATH, "//*[@text='Завершить настройку' or contains(@text, 'Завершить настройку')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Завершить')]")
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    
    # Locators для проверки данных профиля
    SUMMARY_TITLE = [
        (By.XPATH, "//*[@text='Ваши данные:' or contains(@text, 'Ваши данные')]"),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница завершения настройки профиля"""
        if timeout is not None:
            return self.is_displayed_multiple(self.COMPLETE_PROFILE_SCREEN_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.COMPLETE_PROFILE_SCREEN_TITLE)
    
    def click_complete(self):
        """Кликает на кнопку 'Завершить настройку'"""
        self.click_multiple(self.COMPLETE_BUTTON)
        time.sleep(2)  # Ожидание начала создания профиля
        return self
    
    def click_back(self):
        """Кликает на кнопку назад"""
        try:
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            self.driver.back()
        time.sleep(2)
        return self
    
    def wait_for_profile_creation(self, timeout=10):
        """Ожидает завершения создания профиля и перехода на главный экран"""
        import time as time_module
        start_time = time_module.time()
        
        while time_module.time() - start_time < timeout:
            # Проверяем, что мы больше не на экране завершения настройки
            if not self.is_page_loaded(timeout=1):
                return True
            time_module.sleep(0.5)
        
        return False

