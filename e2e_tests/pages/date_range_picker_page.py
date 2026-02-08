"""
Page Object для компонента выбора диапазона дат (DateRangePicker)
Story 3.10: View Meal History Across Multiple Dates

UI Structure (DateRangePicker.tsx):
- Preset кнопки: preset_last_7_days, preset_last_30_days, preset_this_month, preset_last_month
- Кнопка выбора начальной даты: start_date_picker_button
- Кнопка выбора конечной даты: end_date_picker_button
- Кнопка отмены: date_range_cancel_button
- Кнопка подтверждения: date_range_confirm_button

User Flow:
1. Открытие DateRangePicker из MealHistoryScreen
2. Выбор preset диапазона или кастомного диапазона
3. Подтверждение выбора
"""
import os
import sys
import time
from datetime import datetime, date, timedelta
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class DateRangePickerPage(BasePage):
    """Класс для работы с компонентом выбора диапазона дат (DateRangePicker)"""
    
    # ==========================================================================
    # Preset кнопки
    # ==========================================================================
    
    PRESET_LAST_7_DAYS = (AppiumBy.ACCESSIBILITY_ID, "preset_last_7_days")
    PRESET_LAST_30_DAYS = (AppiumBy.ACCESSIBILITY_ID, "preset_last_30_days")
    PRESET_THIS_MONTH = (AppiumBy.ACCESSIBILITY_ID, "preset_this_month")
    PRESET_LAST_MONTH = (AppiumBy.ACCESSIBILITY_ID, "preset_last_month")
    
    # ==========================================================================
    # Кнопки выбора дат
    # ==========================================================================
    
    START_DATE_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "start_date_picker_button")
    END_DATE_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "end_date_picker_button")
    
    # ==========================================================================
    # Кнопки действий
    # ==========================================================================
    
    CANCEL_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "date_range_cancel_button")
    CONFIRM_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "date_range_confirm_button")
    
    # ==========================================================================
    # Методы выбора preset диапазонов
    # ==========================================================================
    
    def select_preset_last_7_days(self):
        """Выбирает preset 'Последние 7 дней'"""
        button = self.find_element_safe(self.PRESET_LAST_7_DAYS)
        if button:
            button.click()
            time.sleep(0.5)
        else:
            raise Exception("Кнопка 'Последние 7 дней' не найдена")
    
    def select_preset_last_30_days(self):
        """Выбирает preset 'Последние 30 дней'"""
        button = self.find_element_safe(self.PRESET_LAST_30_DAYS)
        if button:
            button.click()
            time.sleep(0.5)
        else:
            raise Exception("Кнопка 'Последние 30 дней' не найдена")
    
    def select_preset_this_month(self):
        """Выбирает preset 'Этот месяц'"""
        button = self.find_element_safe(self.PRESET_THIS_MONTH)
        if button:
            button.click()
            time.sleep(0.5)
        else:
            raise Exception("Кнопка 'Этот месяц' не найдена")
    
    def select_preset_last_month(self):
        """Выбирает preset 'Прошлый месяц'"""
        button = self.find_element_safe(self.PRESET_LAST_MONTH)
        if button:
            button.click()
            time.sleep(0.5)
        else:
            raise Exception("Кнопка 'Прошлый месяц' не найдена")
    
    def select_preset_range(self, preset_name):
        """
        Выбирает preset диапазон по имени
        
        Args:
            preset_name: 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'LAST_MONTH'
        """
        preset_map = {
            'LAST_7_DAYS': self.select_preset_last_7_days,
            'LAST_30_DAYS': self.select_preset_last_30_days,
            'THIS_MONTH': self.select_preset_this_month,
            'LAST_MONTH': self.select_preset_last_month,
        }
        
        if preset_name in preset_map:
            preset_map[preset_name]()
        else:
            raise ValueError(f"Неизвестный preset: {preset_name}")
    
    # ==========================================================================
    # Методы выбора кастомного диапазона
    # ==========================================================================
    
    def select_start_date(self, target_date):
        """
        Выбирает начальную дату через календарь
        
        Args:
            target_date: datetime.date - дата для выбора
        """
        from pages.calendar_modal_page import CalendarModalPage
        
        start_button = self.find_element_safe(self.START_DATE_BUTTON)
        if start_button:
            start_button.click()
            time.sleep(1)
            
            # Открывается CalendarModal
            calendar = CalendarModalPage(self.driver)
            if calendar.is_page_loaded(timeout=5):
                calendar.select_date(target_date)
                time.sleep(0.5)
        else:
            raise Exception("Кнопка выбора начальной даты не найдена")
    
    def select_end_date(self, target_date):
        """
        Выбирает конечную дату через календарь
        
        Args:
            target_date: datetime.date - дата для выбора
        """
        from pages.calendar_modal_page import CalendarModalPage
        
        end_button = self.find_element_safe(self.END_DATE_BUTTON)
        if end_button:
            end_button.click()
            time.sleep(1)
            
            # Открывается CalendarModal
            calendar = CalendarModalPage(self.driver)
            if calendar.is_page_loaded(timeout=5):
                calendar.select_date(target_date)
                time.sleep(0.5)
        else:
            raise Exception("Кнопка выбора конечной даты не найдена")
    
    def select_custom_range(self, start_date, end_date):
        """
        Выбирает кастомный диапазон дат
        
        Args:
            start_date: datetime.date - начальная дата
            end_date: datetime.date - конечная дата
        """
        self.select_start_date(start_date)
        self.select_end_date(end_date)
    
    # ==========================================================================
    # Методы действий
    # ==========================================================================
    
    def apply(self):
        """Применяет выбранный диапазон дат"""
        confirm_button = self.find_element_safe(self.CONFIRM_BUTTON)
        if confirm_button:
            confirm_button.click()
            time.sleep(1)  # Ожидание применения
        else:
            raise Exception("Кнопка подтверждения не найдена")
    
    def cancel(self):
        """Отменяет выбор диапазона дат"""
        cancel_button = self.find_element_safe(self.CANCEL_BUTTON)
        if cancel_button:
            cancel_button.click()
            time.sleep(0.5)
        else:
            raise Exception("Кнопка отмены не найдена")
    
    def is_validation_error_shown(self):
        """
        Проверяет, отображается ли ошибка валидации (например, endDate < startDate)
        
        Returns:
            bool: True если ошибка валидации отображается
        """
        # Ищем текст ошибки валидации
        error_texts = [
            "Конечная дата должна быть больше или равна начальной",
            "End date must be greater than or equal to start date",
            "Неверный диапазон дат"
        ]
        
        for error_text in error_texts:
            error_element = self.find_element_safe(
                (By.XPATH, f"//*[contains(@text, '{error_text}')]"),
                timeout=2
            )
            if error_element:
                return True
        
        return False
    
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
            # Проверяем наличие хотя бы одной preset кнопки
            preset_button = self.find_element_safe(self.PRESET_LAST_7_DAYS, timeout=timeout)
            confirm_button = self.find_element_safe(self.CONFIRM_BUTTON, timeout=timeout)
            
            return preset_button is not None and confirm_button is not None
        except Exception as e:
            print(f"[is_page_loaded] Ошибка проверки загрузки: {e}")
            return False
