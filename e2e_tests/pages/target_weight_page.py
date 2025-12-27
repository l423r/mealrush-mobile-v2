"""
Page Object для экрана ввода целевого веса (GetTargetWeight)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class TargetWeightPage(BasePage):
    """Класс для работы с экраном ввода целевого веса"""
    
    # Locators
    TARGET_WEIGHT_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Целевой вес' or contains(@text, 'Целевой вес')]"),
        (By.XPATH, "//*[contains(@text, 'Какой ваш целевой вес') or contains(@text, 'Какой вес вы хотите')]")
    ]
    
    TARGET_WEIGHT_INPUT = [
        (By.XPATH, "//android.widget.EditText"),
        (By.XPATH, "//*[@hint or @text='']")
    ]
    
    UNIT_BUTTON = [
        (By.XPATH, "//*[@text='KG' or @text='LBS']"),
        (By.XPATH, "//*[contains(@text, 'KG') or contains(@text, 'LBS')]")
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
        """Проверяет, загрузилась ли страница ввода целевого веса"""
        if timeout is not None:
            return self.is_displayed_multiple(self.TARGET_WEIGHT_SCREEN_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.TARGET_WEIGHT_SCREEN_TITLE)
    
    def enter_target_weight(self, weight):
        """Вводит целевой вес в килограммах"""
        try:
            # Ищем поле ввода целевого веса (уменьшен таймаут для ускорения)
            input_field = self.find_element_multiple(self.TARGET_WEIGHT_INPUT, timeout=3)
            input_field.clear()
            input_field.send_keys(str(weight))
            time.sleep(0.2)  # Уменьшено с 0.5 до 0.2
        except Exception as e:
            print(f"Warning: Could not enter target weight: {e}")
            # Пробуем альтернативный способ
            try:
                from appium.webdriver.common.appiumby import AppiumBy
                input_field = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "target_weight_input")
                input_field.clear()
                input_field.send_keys(str(weight))
                time.sleep(0.2)
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

