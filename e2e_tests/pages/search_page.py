"""
Page Object для экрана поиска продуктов
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class SearchPage(BasePage):
    """Класс для работы с экраном поиска"""
    
    # Locators
    SEARCH_INPUT = (By.XPATH, "//android.widget.EditText[contains(@hint, 'Поиск') or contains(@content-desc, 'Поиск')]")
    PRODUCT_ITEM = (By.XPATH, "//*[contains(@text, 'ккал') or contains(@content-desc, 'ккал')]/ancestor::android.view.ViewGroup[1]")
    FAVORITE_BUTTON = (By.XPATH, "//*[@content-desc='Избранное' or contains(@content-desc, '❤️')]")
    SCANNER_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Сканер') or contains(@content-desc, 'Сканер')]")
    CREATE_PRODUCT_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Создать продукт') or contains(@text, 'Добавить продукт')]")
    LOADING_INDICATOR = (By.XPATH, "//*[contains(@text, 'Загрузка')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.SEARCH_INPUT
    
    def is_page_loaded(self):
        """Проверяет, загрузилась ли страница поиска"""
        return self.is_displayed(self.SEARCH_INPUT)
    
    def enter_search_query(self, query):
        """Вводит поисковый запрос"""
        self.send_keys(self.SEARCH_INPUT, query)
        # Ждем завершения поиска
        time.sleep(2)
        return self
    
    def clear_search(self):
        """Очищает поисковый запрос"""
        try:
            search_input = self.find_element(self.SEARCH_INPUT)
            search_input.clear()
            # Триггерим событие изменения
            search_input.send_keys(' ')
            search_input.clear()
        except Exception:
            pass
        return self
    
    def wait_for_search_results(self, timeout=10):
        """Ожидает появления результатов поиска"""
        try:
            # Ждем исчезновения индикатора загрузки
            self.wait_for_element_invisible(self.LOADING_INDICATOR, timeout)
            return True
        except Exception:
            # Проверяем наличие продуктов
            return self.is_displayed(self.PRODUCT_ITEM)
    
    def get_products_count(self):
        """Получает количество найденных продуктов"""
        try:
            products = self.find_elements(self.PRODUCT_ITEM)
            return len(products)
        except Exception:
            return 0
    
    def click_product(self, index=0):
        """Кликает на продукт по индексу"""
        products = self.find_elements(self.PRODUCT_ITEM)
        if products and index < len(products):
            products[index].click()
            time.sleep(2)
        return self
    
    def click_scanner(self):
        """Кликает на кнопку сканера"""
        self.click(self.SCANNER_BUTTON)
        time.sleep(2)
        return self
    
    def click_create_product(self):
        """Кликает на кнопку создания продукта"""
        self.click(self.CREATE_PRODUCT_BUTTON)
        time.sleep(2)
        return self
    
    def click_favorite_button(self, product_index=0):
        """Кликает на кнопку избранного для продукта"""
        products = self.find_elements(self.PRODUCT_ITEM)
        if products and product_index < len(products):
            favorite_buttons = self.find_elements(self.FAVORITE_BUTTON)
            if favorite_buttons and product_index < len(favorite_buttons):
                favorite_buttons[product_index].click()
                time.sleep(1)
        return self
    
    def search_product(self, query):
        """Выполняет поиск продукта"""
        self.enter_search_query(query)
        self.wait_for_search_results()
        self.take_screenshot(f'search_results_{query}')
        return self
    
    def get_product_name(self, index=0):
        """Получает название продукта по индексу"""
        try:
            products = self.find_elements(self.PRODUCT_ITEM)
            if products and index < len(products):
                # Пытаемся найти текст с названием продукта
                name_locator = (By.XPATH, f"//android.widget.TextView[not(contains(@text, 'ккал'))]")
                names = products[index].find_elements(*name_locator)
                if names:
                    return names[0].text
        except Exception:
            pass
        return None

