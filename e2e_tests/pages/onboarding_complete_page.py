"""
Page Object для экрана завершения onboarding (OnboardingCompleteScreen)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class OnboardingCompletePage(BasePage):
    """Класс для работы с экраном завершения onboarding"""
    
    # Locators
    ONBOARDING_COMPLETE_TITLE = [
        (By.XPATH, "//*[@text='Отлично! 🎉' or contains(@text, 'Отлично')]"),
        (By.XPATH, "//*[contains(@text, 'успешно завершили настройку')]")
    ]
    
    LOG_MEAL_BUTTON = [
        (By.XPATH, "//*[@text='Записать прием пищи' or contains(@text, 'Записать прием пищи')]"),
        (By.XPATH, "//*[contains(@text, 'прием пищи')]")
    ]
    
    ANALYZE_PHOTO_BUTTON = [
        (By.XPATH, "//*[@text='Анализ фото' or contains(@text, 'Анализ фото')]"),
        (By.XPATH, "//*[contains(@text, 'Анализ фото')]")
    ]
    
    START_USING_BUTTON = [
        (By.XPATH, "//*[@text='Начать использовать приложение' or contains(@text, 'Начать использовать')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Начать')]")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница завершения onboarding"""
        if timeout is None:
            timeout = 10
        return self.is_displayed_multiple(self.ONBOARDING_COMPLETE_TITLE, timeout=timeout)
    
    def click_log_meal(self):
        """Кликает на кнопку 'Записать прием пищи'"""
        self.click_multiple(self.LOG_MEAL_BUTTON)
        time.sleep(2)
        return self
    
    def click_analyze_photo(self):
        """Кликает на кнопку 'Анализ фото'"""
        self.click_multiple(self.ANALYZE_PHOTO_BUTTON)
        time.sleep(2)
        return self
    
    def click_start_using(self):
        """Кликает на кнопку 'Начать использовать приложение'"""
        self.click_multiple(self.START_USING_BUTTON)
        time.sleep(3)  # Ожидание перехода в главное приложение
        return self
    
    def has_guidance_actions(self):
        """Проверяет, есть ли кнопки для первого действия (Aha! момент)"""
        try:
            log_meal = self.is_displayed_multiple(self.LOG_MEAL_BUTTON, timeout=2)
            analyze_photo = self.is_displayed_multiple(self.ANALYZE_PHOTO_BUTTON, timeout=2)
            return log_meal or analyze_photo
        except:
            return False
