"""
Page Object для экрана выбора цели (GetTarget)
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
    TARGET_SELECTION_TITLE = [
        (By.XPATH, "//*[@text='Выберите цель' or contains(@text, 'Выберите цель')]"),
        (By.XPATH, "//*[contains(@text, 'Какую цель вы преследуете')]")
    ]
    
    LOSE_WEIGHT_OPTION = [
        (By.XPATH, "//*[@text='Сбросить вес' or contains(@text, 'Сбросить вес')]"),
        (By.XPATH, "//*[contains(@text, 'Создать дефицит калорий')]")
    ]
    
    SAVE_WEIGHT_OPTION = [
        (By.XPATH, "//*[@text='Сохранить вес' or contains(@text, 'Сохранить вес')]"),
        (By.XPATH, "//*[contains(@text, 'Поддерживать текущий вес')]")
    ]
    
    GAIN_WEIGHT_OPTION = [
        (By.XPATH, "//*[@text='Набрать вес' or contains(@text, 'Набрать вес')]"),
        (By.XPATH, "//*[contains(@text, 'Создать профицит калорий')]")
    ]
    
    NEXT_BUTTON = [
        (By.XPATH, "//*[@text='Далее' or contains(@text, 'Далее')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Далее')]")
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    
    # Locators для кнопки выхода (в правом верхнем углу Header)
    LOGOUT_BUTTON = [
        (By.XPATH, "//*[@content-desc='profile_setup_logout_button']"),
        (By.XPATH, "//*[contains(@content-desc, 'logout')]")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница выбора цели"""
        if timeout is not None:
            return self.is_displayed_multiple(self.TARGET_SELECTION_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.TARGET_SELECTION_TITLE)
    
    def select_target(self, target='save'):
        """Выбирает цель: 'lose', 'save' или 'gain'"""
        if target.lower() == 'lose' or target.lower() == 'сбросить':
            self.click_multiple(self.LOSE_WEIGHT_OPTION)
        elif target.lower() == 'gain' or target.lower() == 'набрать':
            self.click_multiple(self.GAIN_WEIGHT_OPTION)
        else:
            # По умолчанию выбираем "Сохранить вес"
            self.click_multiple(self.SAVE_WEIGHT_OPTION)
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
    
    def click_logout_button(self):
        """Кликает на кнопку выхода из аккаунта (если есть)"""
        try:
            self.click_multiple(self.LOGOUT_BUTTON, timeout=2)
            time.sleep(1)
            return True
        except Exception:
            return False





