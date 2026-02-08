"""
Page Object для модального окна календаря (CalendarModal)
Story 3.10: View Meal History Across Multiple Dates

UI Structure (CalendarModal.tsx):
- Кнопка предыдущего месяца: calendar_prev_month_button
- Кнопка следующего месяца: calendar_next_month_button
- Дни календаря: calendar_day_${dateStr} (где dateStr в формате YYYY-MM-DD)
- Индикаторы meals: meal_indicator_${dateStr} (для дат с meals)
- Кнопка отмены: calendar_cancel_button

User Flow:
1. Открытие календаря из MealHistoryScreen или DateRangePicker
2. Навигация по месяцам
3. Выбор даты
4. Подсветка дат с meals
"""
import os
import sys
import time
import re
from datetime import datetime, date
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class CalendarModalPage(BasePage):
    """Класс для работы с модальным окном календаря (CalendarModal)"""
    
    # ==========================================================================
    # Навигация по месяцам
    # ==========================================================================
    
    PREV_MONTH_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "calendar_prev_month_button")
    NEXT_MONTH_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "calendar_next_month_button")
    
    # ==========================================================================
    # Кнопка отмены
    # ==========================================================================
    
    CANCEL_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "calendar_cancel_button")
    
    # ==========================================================================
    # Методы навигации
    # ==========================================================================
    
    def go_to_prev_month(self):
        """Переходит к предыдущему месяцу"""
        button = self.find_element_safe(self.PREV_MONTH_BUTTON)
        if button:
            button.click()
            time.sleep(0.5)  # Ожидание обновления календаря
        else:
            raise Exception("Кнопка предыдущего месяца не найдена")
    
    def go_to_next_month(self):
        """Переходит к следующему месяцу"""
        button = self.find_element_safe(self.NEXT_MONTH_BUTTON)
        if button:
            button.click()
            time.sleep(0.5)  # Ожидание обновления календаря
        else:
            raise Exception("Кнопка следующего месяца не найдена")
    
    def go_to_month(self, target_date):
        """
        Переходит к месяцу, содержащему указанную дату
        
        Args:
            target_date: datetime.date - дата для навигации
        """
        current_date = date.today()
        target_month = target_date.replace(day=1)
        current_month = current_date.replace(day=1)
        
        # Вычисляем разницу в месяцах
        months_diff = (target_month.year - current_month.year) * 12 + (target_month.month - current_month.month)
        
        if months_diff > 0:
            # Переходим вперед
            for _ in range(months_diff):
                self.go_to_next_month()
        elif months_diff < 0:
            # Переходим назад
            for _ in range(abs(months_diff)):
                self.go_to_prev_month()
    
    # ==========================================================================
    # Методы выбора даты
    # ==========================================================================
    
    def get_day_element(self, target_date):
        """
        Получает элемент дня календаря для указанной даты
        
        Args:
            target_date: datetime.date - дата для поиска
        
        Returns:
            WebElement или None
        """
        date_str = target_date.strftime("%Y-%m-%d")
        test_id = f"calendar_day_{date_str}"
        
        return self.find_element_safe((AppiumBy.ACCESSIBILITY_ID, test_id))
    
    def select_date(self, target_date):
        """
        Выбирает дату в календаре
        
        Args:
            target_date: datetime.date - дата для выбора
        """
        # Сначала переходим к нужному месяцу
        self.go_to_month(target_date)
        
        # Затем выбираем дату
        day_element = self.get_day_element(target_date)
        if day_element:
            day_element.click()
            time.sleep(0.5)  # Ожидание выбора
        else:
            raise Exception(f"День {target_date} не найден в календаре")
    
    # ==========================================================================
    # Методы проверки подсветки дат с meals
    # ==========================================================================
    
    def get_meal_indicator(self, target_date):
        """
        Получает индикатор meal для указанной даты
        
        Args:
            target_date: datetime.date - дата для проверки
        
        Returns:
            WebElement или None
        """
        date_str = target_date.strftime("%Y-%m-%d")
        test_id = f"meal_indicator_{date_str}"
        
        return self.find_element_safe((AppiumBy.ACCESSIBILITY_ID, test_id))
    
    def is_date_highlighted(self, target_date):
        """
        Проверяет, подсвечена ли дата (имеет ли meals)
        
        Args:
            target_date: datetime.date - дата для проверки
        
        Returns:
            bool: True если дата подсвечена
        """
        # Сначала переходим к нужному месяцу
        self.go_to_month(target_date)
        
        # Проверяем наличие индикатора
        indicator = self.get_meal_indicator(target_date)
        return indicator is not None
    
    def get_highlighted_dates(self):
        """
        Получает список всех подсвеченных дат (дат с meals) в текущем месяце
        
        Returns:
            list: Список datetime.date объектов
        """
        highlighted_dates = []
        
        # Ищем все индикаторы meals
        indicators = self.driver.find_elements(
            By.XPATH, "//*[starts-with(@content-desc, 'meal_indicator_')]"
        )
        
        for indicator in indicators:
            test_id = indicator.get_attribute("content-desc")
            # Извлекаем дату из testID: meal_indicator_YYYY-MM-DD
            date_str = test_id.replace("meal_indicator_", "")
            try:
                highlighted_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                highlighted_dates.append(highlighted_date)
            except ValueError:
                print(f"[get_highlighted_dates] Не удалось распарсить дату: {date_str}")
        
        return highlighted_dates
    
    # ==========================================================================
    # Методы действий
    # ==========================================================================
    
    def cancel(self):
        """Закрывает календарь без выбора даты"""
        cancel_button = self.find_element_safe(self.CANCEL_BUTTON)
        if cancel_button:
            cancel_button.click()
            time.sleep(0.5)
        else:
            raise Exception("Кнопка отмены не найдена")
    
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
            # Проверяем наличие кнопок навигации
            prev_button = self.find_element_safe(self.PREV_MONTH_BUTTON, timeout=timeout)
            next_button = self.find_element_safe(self.NEXT_MONTH_BUTTON, timeout=timeout)
            
            return prev_button is not None and next_button is not None
        except Exception as e:
            print(f"[is_page_loaded] Ошибка проверки загрузки: {e}")
            return False
