"""
Page Object для экрана истории приемов пищи (MealHistoryScreen)
Story 3.10: View Meal History Across Multiple Dates

UI Structure (MealHistoryScreen.tsx):
- Header с заголовком "История приемов пищи"
- Кнопка календаря (meal_history_calendar_button)
- Кнопка выбора диапазона дат (meal_history_date_range_button)
- Список DateSummaryCard, сгруппированных по датам (date_summary_${dateKey})
- MealTrendsChart компонент (meal_history_trends_chart)
- FlashList с meals (meal_history_list)

User Flow:
1. Открытие экрана истории через MainScreen
2. Выбор диапазона дат через DateRangePicker
3. Просмотр meals, сгруппированных по датам
4. Навигация через календарь
5. Просмотр трендов за выбранный период
"""
import os
import sys
import time
from datetime import datetime, date
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MealHistoryPage(BasePage):
    """Класс для работы с экраном истории приемов пищи (MealHistoryScreen)"""
    
    # ==========================================================================
    # Основные элементы экрана
    # ==========================================================================
    
    # Кнопка открытия календаря
    CALENDAR_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "meal_history_calendar_button")
    
    # Кнопка выбора диапазона дат
    DATE_RANGE_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "meal_history_date_range_button")
    
    # Компонент трендов
    TRENDS_CHART = (AppiumBy.ACCESSIBILITY_ID, "meal_history_trends_chart")
    
    # Список meals
    MEAL_LIST = (AppiumBy.ACCESSIBILITY_ID, "meal_history_list")
    
    # ==========================================================================
    # DateSummaryCard - карточки сводки по датам
    # ==========================================================================
    
    def get_date_summary_card(self, date_key):
        """
        Получает карточку сводки для указанной даты
        
        Args:
            date_key: Ключ даты в формате YYYY-MM-DD
        
        Returns:
            WebElement или None
        """
        test_id = f"date_summary_{date_key}"
        return self.find_element_safe((AppiumBy.ACCESSIBILITY_ID, test_id))
    
    def get_date_summary_info(self, date_key):
        """
        Получает информацию из карточки сводки для даты
        
        Args:
            date_key: Ключ даты в формате YYYY-MM-DD
        
        Returns:
            dict: {'total_calories': int, 'meal_count': int, 'total_proteins': float, ...}
        """
        card = self.get_date_summary_card(date_key)
        if not card:
            return None
        
        # Извлекаем информацию из карточки
        # Структура: DateSummaryCard содержит TextViews с калориями, количеством meals и т.д.
        try:
            calories_text = card.find_element(
                By.XPATH, ".//android.widget.TextView[contains(@text, 'ккал')]"
            ).text
            calories = int(re.search(r'\d+', calories_text).group())
            
            meal_count_text = card.find_element(
                By.XPATH, ".//android.widget.TextView[contains(@text, 'прием')]"
            ).text
            meal_count = int(re.search(r'\d+', meal_count_text).group())
            
            return {
                'total_calories': calories,
                'meal_count': meal_count
            }
        except Exception as e:
            print(f"[get_date_summary_info] Ошибка извлечения информации: {e}")
            return None
    
    def click_date_summary(self, date_key):
        """
        Кликает на карточку сводки для даты (переход к детальному просмотру даты)
        
        Args:
            date_key: Ключ даты в формате YYYY-MM-DD
        """
        card = self.get_date_summary_card(date_key)
        if card:
            card.click()
            time.sleep(1)  # Ожидание перехода
        else:
            raise Exception(f"Карточка сводки для даты {date_key} не найдена")
    
    # ==========================================================================
    # Навигация и действия
    # ==========================================================================
    
    def open_calendar(self):
        """
        Открывает календарь для выбора даты
        
        Returns:
            CalendarModalPage или None
        """
        from pages.calendar_modal_page import CalendarModalPage
        
        calendar_button = self.find_element_safe(self.CALENDAR_BUTTON)
        if calendar_button:
            calendar_button.click()
            time.sleep(1)  # Ожидание открытия модального окна
            
            calendar_modal = CalendarModalPage(self.driver)
            if calendar_modal.is_page_loaded(timeout=5):
                return calendar_modal
        
        return None
    
    def open_date_range_picker(self):
        """
        Открывает DateRangePicker для выбора диапазона дат
        
        Returns:
            DateRangePickerPage или None
        """
        from pages.date_range_picker_page import DateRangePickerPage
        
        date_range_button = self.find_element_safe(self.DATE_RANGE_BUTTON)
        if date_range_button:
            date_range_button.click()
            time.sleep(1)  # Ожидание открытия модального окна
            
            date_range_picker = DateRangePickerPage(self.driver)
            if date_range_picker.is_page_loaded(timeout=5):
                return date_range_picker
        
        return None
    
    def get_meals_by_date(self):
        """
        Получает все meals, сгруппированные по датам
        
        Returns:
            dict: {date_key: [meal_objects]}
        """
        meals_by_date = {}
        
        # Получаем все DateSummaryCard
        date_cards = self.driver.find_elements(
            By.XPATH, "//*[starts-with(@content-desc, 'date_summary_')]"
        )
        
        for card in date_cards:
            test_id = card.get_attribute("content-desc")
            date_key = test_id.replace("date_summary_", "")
            
            # Получаем meals для этой даты (они находятся после карточки сводки)
            # TODO: Реализовать извлечение meals из списка
            meals_by_date[date_key] = []
        
        return meals_by_date
    
    def scroll_to_bottom(self):
        """Прокручивает список до конца (для lazy loading)"""
        list_element = self.find_element_safe(self.MEAL_LIST)
        if list_element:
            # Прокрутка вниз
            self.driver.execute_script("mobile: scroll", {
                "direction": "down",
                "element": list_element.id
            })
            time.sleep(1)  # Ожидание загрузки новых элементов
    
    def wait_for_meals_loaded(self, timeout=10):
        """
        Ожидает загрузки meals
        
        Args:
            timeout: Максимальное время ожидания в секундах
        """
        start_time = time.time()
        while time.time() - start_time < timeout:
            # Проверяем наличие хотя бы одной DateSummaryCard
            cards = self.driver.find_elements(
                By.XPATH, "//*[starts-with(@content-desc, 'date_summary_')]"
            )
            if len(cards) > 0:
                return True
            time.sleep(0.5)
        return False
    
    def get_trends_info(self):
        """
        Получает информацию о трендах из MealTrendsChart
        
        Returns:
            dict: {'average_calories': float, 'average_meal_count': float, ...}
        """
        trends_chart = self.find_element_safe(self.TRENDS_CHART)
        if not trends_chart:
            return None
        
        # TODO: Извлечь информацию о трендах из графика
        # Это может потребовать парсинга SVG или текстовых меток
        return {
            'average_calories': 0,
            'average_meal_count': 0
        }
    
    def switch_trend_metric(self, metric='calories'):
        """
        Переключает метрику тренда (calories или mealCount)
        
        Args:
            metric: 'calories' или 'mealCount'
        """
        metric_button = self.find_element_safe(
            (AppiumBy.ACCESSIBILITY_ID, f"trend_metric_{metric}")
        )
        if metric_button:
            metric_button.click()
            time.sleep(0.5)
    
    # ==========================================================================
    # Проверка загрузки страницы
    # ==========================================================================
    
    def is_page_loaded(self, timeout=10):
        """
        Проверяет, загрузилась ли страница
        
        Args:
            timeout: Максимальное время ожидания в секундах
        
        Returns:
            bool: True если страница загружена
        """
        try:
            # Проверяем наличие основных элементов
            calendar_button = self.find_element_safe(self.CALENDAR_BUTTON, timeout=timeout)
            date_range_button = self.find_element_safe(self.DATE_RANGE_BUTTON, timeout=timeout)
            
            return calendar_button is not None and date_range_button is not None
        except Exception as e:
            print(f"[is_page_loaded] Ошибка проверки загрузки: {e}")
            return False
