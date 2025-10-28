"""
Page Object для главного экрана (Home)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MainPage(BasePage):
    """Класс для работы с главным экраном"""
    
    # Locators
    ADD_MEAL_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить прием пищи')]")
    DATE_PREV_BUTTON = (By.XPATH, "//*[contains(@content-desc, '‹') or contains(@text, '‹')]")
    DATE_NEXT_BUTTON = (By.XPATH, "//*[contains(@content-desc, '›') or contains(@text, '›')]")
    MEAL_CARD = (By.XPATH, "//*[contains(@content-desc, 'ккал') or contains(@text, 'ккал')]")
    DAILY_CALORIES = (By.XPATH, "//*[contains(@text, 'ккал')]/parent::*//preceding-sibling::*[1]")
    NAVIGATION_TABS = (By.XPATH, "//android.widget.TabWidget/*")
    PROFILE_TAB = (By.XPATH, "//*[@content-desc='Профиль']")
    SEARCH_TAB = (By.XPATH, "//*[@content-desc='Поиск']")
    HOME_TAB = (By.XPATH, "//*[@content-desc='Главная']")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.ADD_MEAL_BUTTON
    
    def is_page_loaded(self):
        """Проверяет, загрузилась ли главная страница"""
        return self.is_displayed(self.ADD_MEAL_BUTTON)
    
    def click_add_meal_button(self):
        """Кликает на кнопку добавления приема пищи"""
        self.click(self.ADD_MEAL_BUTTON)
        time.sleep(2)
        return self
    
    def change_date(self, direction='next'):
        """Меняет дату (prev/next)"""
        if direction == 'prev':
            self.click(self.DATE_PREV_BUTTON)
        else:
            self.click(self.DATE_NEXT_BUTTON)
        time.sleep(1)
        return self
    
    def get_daily_calories(self):
        """Получает значение дневных калорий"""
        try:
            text = self.get_text(self.DAILY_CALORIES)
            # Извлекаем только число
            import re
            numbers = re.findall(r'\d+', text)
            return int(numbers[0]) if numbers else 0
        except Exception:
            return 0
    
    def get_meals_count(self):
        """Получает количество приемов пищи"""
        try:
            meals = self.find_elements(self.MEAL_CARD)
            return len(meals)
        except Exception:
            return 0
    
    def click_meal_card(self, index=0):
        """Кликает на карточку приема пищи по индексу"""
        meals = self.find_elements(self.MEAL_CARD)
        if meals and index < len(meals):
            meals[index].click()
            time.sleep(2)
        return self
    
    def navigate_to_profile(self):
        """Переходит на вкладку профиля"""
        self.click(self.PROFILE_TAB)
        time.sleep(2)
        return self
    
    def navigate_to_search(self):
        """Переходит на вкладку поиска"""
        self.click(self.SEARCH_TAB)
        time.sleep(2)
        return self
    
    def navigate_to_home(self):
        """Переходит на вкладку главной"""
        self.click(self.HOME_TAB)
        time.sleep(2)
        return self
    
    def wait_for_meals_loaded(self, timeout=20):
        """Ожидает загрузки приемов пищи"""
        try:
            self.find_element(self.ADD_MEAL_BUTTON, timeout)
            return True
        except Exception:
            return False

