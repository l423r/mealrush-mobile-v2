"""
Page Object для экрана выбора уровня активности (GetActivity)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class ActivityPage(BasePage):
    """Класс для работы с экраном выбора уровня активности"""
    
    # Locators
    ACTIVITY_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Уровень активности' or contains(@text, 'Уровень активности')]"),
        (By.XPATH, "//*[contains(@text, 'Какой у вас уровень активности')]")
    ]
    
    # Варианты активности
    MINIMAL_ACTIVITY = [
        (By.XPATH, "//*[contains(@text, 'Минимальная активность')]"),
        (By.XPATH, "//*[contains(@text, 'Сидячий образ жизни')]")
    ]
    
    LIGHT_ACTIVITY = [
        (By.XPATH, "//*[contains(@text, 'Легкая активность')]"),
        (By.XPATH, "//*[contains(@text, 'Легкие упражнения 1-3 дня')]")
    ]
    
    MODERATE_ACTIVITY = [
        (By.XPATH, "//*[contains(@text, 'Умеренная активность')]"),
        (By.XPATH, "//*[contains(@text, 'Умеренные упражнения 3-5 дней')]")
    ]
    
    HIGH_ACTIVITY = [
        (By.XPATH, "//*[contains(@text, 'Высокая активность')]"),
        (By.XPATH, "//*[contains(@text, 'Интенсивные упражнения 6-7 дней')]")
    ]
    
    VERY_HIGH_ACTIVITY = [
        (By.XPATH, "//*[contains(@text, 'Очень высокая активность')]"),
        (By.XPATH, "//*[contains(@text, 'Очень интенсивные упражнения')]")
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
        """Проверяет, загрузилась ли страница выбора активности"""
        if timeout is not None:
            return self.is_displayed_multiple(self.ACTIVITY_SCREEN_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.ACTIVITY_SCREEN_TITLE)
    
    def select_activity(self, activity='second'):
        """Выбирает уровень активности: 'first', 'second', 'third', 'fourth', 'fifth'"""
        activity = activity.lower()
        
        if activity == 'first' or activity == 'minimal':
            self.click_multiple(self.MINIMAL_ACTIVITY)
        elif activity == 'third' or activity == 'moderate':
            self.click_multiple(self.MODERATE_ACTIVITY)
        elif activity == 'fourth' or activity == 'high':
            self.click_multiple(self.HIGH_ACTIVITY)
        elif activity == 'fifth' or activity == 'very_high':
            self.click_multiple(self.VERY_HIGH_ACTIVITY)
        else:
            # По умолчанию выбираем "Легкая активность" (SECOND)
            self.click_multiple(self.LIGHT_ACTIVITY)
        
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

