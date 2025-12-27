"""
Page Object для экрана ввода роста (GetHeight)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class HeightPage(BasePage):
    """Класс для работы с экраном ввода роста"""
    
    # Locators
    HEIGHT_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Ваш рост' or contains(@text, 'Ваш рост')]"),
        (By.XPATH, "//*[contains(@text, 'Какой у вас рост')]")
    ]
    
    HEIGHT_INPUT = [
        (By.XPATH, "//android.widget.EditText"),
        (By.XPATH, "//*[@hint or @text='']")
    ]
    
    UNIT_BUTTON = [
        (By.XPATH, "//*[@text='CM' or @text='FT']"),
        (By.XPATH, "//*[contains(@text, 'CM') or contains(@text, 'FT')]")
    ]
    
    NEXT_BUTTON = [
        (By.XPATH, "//*[@text='Далее' or contains(@text, 'Далее')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Далее')]")
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница ввода роста"""
        if timeout is not None:
            return self.is_displayed_multiple(self.HEIGHT_SCREEN_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.HEIGHT_SCREEN_TITLE)
    
    def enter_height(self, height):
        """Вводит рост в сантиметрах"""
        try:
            # Ищем поле ввода роста (быстрый поиск, экран обязательный)
            input_field = self.find_element_multiple(self.HEIGHT_INPUT, timeout=2)  # Уменьшено с 3 до 2
            input_field.clear()
            input_field.send_keys(str(height))
            time.sleep(0.1)  # Уменьшено с 0.2 до 0.1 - минимальная задержка
        except Exception as e:
            print(f"Warning: Could not enter height: {e}")
            # Пробуем альтернативный способ
            try:
                from appium.webdriver.common.appiumby import AppiumBy
                input_field = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "height_input")
                input_field.clear()
                input_field.send_keys(str(height))
                time.sleep(0.1)
            except:
                raise
        return self
    
    def click_next(self):
        """Кликает на кнопку 'Далее'"""
        self.click_multiple(self.NEXT_BUTTON, timeout=3)  # Уменьшен таймаут
        time.sleep(1)  # Уменьшено с 2 до 1
        return self
    
    def click_back(self):
        """Кликает на кнопку назад"""
        try:
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            self.driver.back()
        time.sleep(2)
        return self

