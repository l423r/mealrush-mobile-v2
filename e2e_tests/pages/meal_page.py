"""
Page Object для экрана приема пищи (Meal Details)
Story 3.1: Create Meal Entry
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MealPage(BasePage):
    """Класс для работы с экраном деталей приема пищи"""
    
    # Locators
    MEAL_TITLE = (By.XPATH, "//*[contains(@text, 'Завтрак') or contains(@text, 'Обед') or contains(@text, 'Ужин') or contains(@text, 'Полдник') or contains(@text, 'Поздний ужин') or contains(@text, 'Перекус')]")
    MEAL_TIME = (By.XPATH, "//*[contains(@text, ':')]")  # Time format HH:MM
    ADD_PRODUCT_BUTTON = (By.XPATH, "//*[contains(@text, 'Добавить') or contains(@content-desc, 'add')]")
    MEAL_ELEMENT_CARD = (By.XPATH, "//*[contains(@text, 'ккал')]")
    BACK_BUTTON = (By.XPATH, "//*[@content-desc='Назад' or contains(@content-desc, 'back')]")
    DELETE_MEAL_BUTTON = (By.XPATH, "//*[contains(@text, 'Удалить') or contains(@content-desc, 'delete')]")
    EDIT_MEAL_BUTTON = (By.XPATH, "//*[contains(@content-desc, 'create') or contains(@content-desc, 'edit')]")
    
    # Meal type indicators
    MEAL_TYPE_INDICATORS = [
        (By.XPATH, "//*[@text='Завтрак']"),
        (By.XPATH, "//*[@text='Обед']"),
        (By.XPATH, "//*[@text='Ужин']"),
        (By.XPATH, "//*[@text='Полдник']"),
        (By.XPATH, "//*[@text='Поздний ужин']"),
        (By.XPATH, "//*[@text='Перекус']"),  # SNACK - new type
    ]
    
    # Summary section
    CALORIES_TEXT = (By.XPATH, "//*[contains(@text, 'ккал')]")
    PROTEINS_TEXT = (By.XPATH, "//*[contains(@text, 'Б')]")
    FATS_TEXT = (By.XPATH, "//*[contains(@text, 'Ж')]")
    CARBS_TEXT = (By.XPATH, "//*[contains(@text, 'У')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.MEAL_TITLE
    
    def is_page_loaded(self, timeout=10):
        """Проверяет, загрузилась ли страница деталей приема пищи"""
        # Проверяем наличие заголовка типа приема пищи
        for indicator in self.MEAL_TYPE_INDICATORS:
            try:
                if self.is_displayed(indicator, timeout=2):
                    return True
            except:
                continue
        
        # Альтернативная проверка - наличие кнопки добавления продукта
        try:
            if self.is_displayed(self.ADD_PRODUCT_BUTTON, timeout=2):
                return True
        except:
            pass
        
        return False
    
    def get_meal_type(self):
        """Получает тип приема пищи"""
        for indicator in self.MEAL_TYPE_INDICATORS:
            try:
                if self.is_displayed(indicator, timeout=1):
                    return self.get_text(indicator)
            except:
                continue
        return None
    
    def get_meal_time(self):
        """Получает время приема пищи"""
        try:
            return self.get_text(self.MEAL_TIME)
        except:
            return None
    
    def click_add_product(self):
        """Кликает на кнопку добавления продукта"""
        self.click(self.ADD_PRODUCT_BUTTON)
        time.sleep(2)
        return self
    
    def get_elements_count(self):
        """Получает количество элементов в приеме пищи"""
        try:
            elements = self.find_elements(self.MEAL_ELEMENT_CARD)
            return len(elements)
        except:
            return 0
    
    def click_element(self, index=0):
        """Кликает на элемент приема пищи по индексу"""
        try:
            elements = self.find_elements(self.MEAL_ELEMENT_CARD)
            if elements and index < len(elements):
                elements[index].click()
                time.sleep(2)
        except:
            pass
        return self
    
    def go_back(self):
        """Возвращается на предыдущий экран"""
        try:
            self.click(self.BACK_BUTTON)
        except:
            # Альтернативный способ - системная кнопка назад
            self.driver.back()
        time.sleep(2)
        return self
    
    def delete_meal(self):
        """Удаляет прием пищи"""
        self.click(self.DELETE_MEAL_BUTTON)
        time.sleep(2)
        return self
    
    def edit_meal(self):
        """Открывает редактирование приема пищи"""
        self.click(self.EDIT_MEAL_BUTTON)
        time.sleep(2)
        return self
    
    def get_total_calories(self):
        """Получает общее количество калорий в приеме пищи"""
        try:
            text = self.get_text(self.CALORIES_TEXT)
            import re
            numbers = re.findall(r'[\d.]+', text)
            return float(numbers[0]) if numbers else 0
        except:
            return 0
    
    def is_meal_empty(self):
        """Проверяет, пустой ли прием пищи (нет элементов)"""
        return self.get_elements_count() == 0
