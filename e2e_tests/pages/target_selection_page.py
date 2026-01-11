"""
Page Object для экрана выбора цели (Target Selection)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class TargetSelectionPage(BasePage):
    """Класс для работы с экраном выбора цели"""
    
    # Locators
    TARGET_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Выберите цель' or contains(@text, 'Выберите цель')]"),
        (By.XPATH, "//*[contains(@text, 'Какую цель вы хотите достичь')]"),
        (By.XPATH, "//*[contains(@text, 'Цель')]")
    ]
    
    # Варианты целей
    SAVE_WEIGHT = [
        (By.XPATH, "//*[contains(@text, 'Сохранить вес') or contains(@text, 'Поддержать вес')]"),
        (By.XPATH, "//*[contains(@text, 'Сохранить')]")
    ]
    
    LOSE_WEIGHT = [
        (By.XPATH, "//*[contains(@text, 'Похудеть') or contains(@text, 'Сбросить вес')]"),
        (By.XPATH, "//*[contains(@text, 'Похудеть')]")
    ]
    
    GAIN_WEIGHT = [
        (By.XPATH, "//*[contains(@text, 'Набрать вес') or contains(@text, 'Поправиться')]"),
        (By.XPATH, "//*[contains(@text, 'Набрать')]")
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
        """Проверяет, загрузилась ли страница выбора цели"""
        if timeout is not None:
            return self.is_displayed_multiple(self.TARGET_SCREEN_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.TARGET_SCREEN_TITLE)
    
    def select_target(self, target='save'):
        """Выбирает цель: 'save', 'lose', 'gain'"""
        target = target.lower()
        
        if target == 'save' or target == 'maintain':
            self.click_multiple(self.SAVE_WEIGHT)
        elif target == 'lose' or target == 'lose_weight':
            self.click_multiple(self.LOSE_WEIGHT)
        elif target == 'gain' or target == 'gain_weight':
            self.click_multiple(self.GAIN_WEIGHT)
        else:
            # По умолчанию выбираем "Сохранить вес"
            self.click_multiple(self.SAVE_WEIGHT)
        
        time.sleep(1)
        return self
    
    def click_next(self):
        """Кликает на кнопку 'Далее'"""
        self.click_multiple(self.NEXT_BUTTON)
        time.sleep(2)
        return self
    
    def click_back(self):
        """Кликает на кнопку назад"""
        try:
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            self.driver.back()
        time.sleep(2)
        return self
