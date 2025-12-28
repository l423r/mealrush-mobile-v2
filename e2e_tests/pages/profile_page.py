"""
Page Object для экрана профиля
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class ProfilePage(BasePage):
    """Класс для работы с экраном профиля"""
    
    # Locators
    EDIT_PROFILE_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Редактировать') or contains(@text, 'Изменить')]")
    SETTINGS_BUTTON = [
        (By.XPATH, "//*[@content-desc='⚙️' or contains(@content-desc, 'Настройки')]"),
        (By.XPATH, "//*[@text='⚙️']"),
    ]
    LOGOUT_BUTTON = [
        (By.XPATH, "//*[@text='Выйти из аккаунта' or contains(@text, 'Выйти из аккаунта')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Выйти')]"),
        (By.XPATH, "//*[contains(@text, 'Выйти')]"),
    ]
    LOGOUT_CONFIRM_BUTTON = [
        (By.XPATH, "//*[@text='Выйти' or contains(@text, 'Выйти')]"),
        (By.XPATH, "//*[@text='Подтвердить' or contains(@text, 'Подтвердить')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Выйти')]"),
    ]
    LOGOUT_DIALOG_TITLE = [
        (By.XPATH, "//*[@text='Выход' or contains(@text, 'Выход')]"),
    ]
    USER_NAME = (By.XPATH, "//android.widget.TextView[contains(@text, 'USER') or contains(@text, 'User')]")
    BMI_VALUE = (By.XPATH, "//android.widget.TextView[contains(@text, 'ИМТ') or contains(@text, 'BMI')]/following-sibling::android.widget.TextView")
    CALORIES_GOAL = (By.XPATH, "//choose_following[contains(@text, 'ккал')]/ancestor::android.view.ViewGroup//android.widget.TextView[1]")
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница профиля"""
        if timeout is None:
            timeout = 20
        
        # Проверяем несколько индикаторов экрана профиля
        profile_indicators = [
            (By.XPATH, "//*[@text='Профиль' or contains(@text, 'Профиль')]"),
            self.SETTINGS_BUTTON[0],
            (By.XPATH, "//*[contains(@text, 'Выйти из аккаунта')]"),
        ]
        
        for indicator in profile_indicators:
            try:
                if isinstance(indicator, tuple):
                    if self.is_displayed(indicator, timeout=2):
                        return True
                else:
                    if self.is_displayed_multiple(indicator, timeout=2):
                        return True
            except:
                continue
        
        return False
    
    def click_edit_profile(self):
        """Кликает на кнопку редактирования профиля"""
        self.click(self.EDIT_PROFILE_BUTTON)
        time.sleep(2)
        return self
    
    def click_settings(self):
        """Кликает на кнопку настроек"""
        self.click(self.SETTINGS_BUTTON)
        time.sleep(2)
        return self
    
    def click_logout(self):
        """Кликает на кнопку выхода"""
        try:
            # Сразу прокручиваем до кнопки выхода (без проверки видимости - экономит время)
            self.scroll_to_logout()
            
            # Ищем и кликаем на кнопку выхода сразу после прокрутки (быстрый поиск)
            self.click_multiple(self.LOGOUT_BUTTON, timeout=1.5)  # Уменьшено с 2 до 1.5
            time.sleep(0.3)  # Уменьшено с 0.5 до 0.3 - минимальная задержка для появления диалога
            
            # Подтверждаем выход в диалоге (быстрая проверка)
        try:
                if self.is_displayed_multiple(self.LOGOUT_DIALOG_TITLE, timeout=0.3):  # Уменьшено с 0.5 до 0.3
                    self.click_multiple(self.LOGOUT_CONFIRM_BUTTON, timeout=1)  # Уменьшено с 1.5 до 1
                    time.sleep(0.3)  # Уменьшено с 0.5 до 0.3
        except Exception:
                # Диалог может быть уже обработан или иметь другой формат
            pass
        except Exception as e:
            print(f"Warning: Could not click logout button: {e}")
            raise
        return self
    
    def get_user_name(self):
        """Получает имя пользователя"""
        try:
            return self.get_text(self.USER_NAME)
        except Exception:
            return None
    
    def get_bmi_value(self):
        """Получает значение BMI"""
        try:
            text = self.get_text(self.BMI_VALUE)
            import re
            numbers = re.findall(r'\d+\.?\d*', text)
            return float(numbers[0]) if numbers else None
        except Exception:
            return None
    
    def get_calories_goal(self):
        """Получает дневную цель по калориям"""
        try:
            text = self.get_text(self.CALORIES_GOAL)
            import re
            numbers = re.findall(r'\d+', text)
            return int(numbers[0]) if numbers else None
        except Exception:
            return None
    
    def scroll_to_logout(self, max_scrolls=5):
        """Прокручивает до кнопки выхода, делая несколько прокруток вниз пока не найдет кнопку"""
        # Оптимизация: сразу делаем 2 быстрых прокрутки без проверки (кнопка всегда после 2 прокруток)
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        start_y = size['height'] * 0.8
        end_y = size['height'] * 0.2
        
        # Первая прокрутка
        self.driver.swipe(start_x, start_y, start_x, end_y, 300)
        time.sleep(0.05)  # Минимальная пауза
        
        # Вторая прокрутка (кнопка всегда после 2 прокруток)
        self.driver.swipe(start_x, start_y, start_x, end_y, 300)
        time.sleep(0.15)  # Пауза для стабилизации после двух прокруток
        
        # Быстрая проверка, видна ли теперь кнопка выхода (уменьшен таймаут)
        if self.is_displayed_multiple(self.LOGOUT_BUTTON, timeout=0.2):  # Уменьшено с 0.3 до 0.2
            return self
        
        # Если не найдена, делаем дополнительные прокрутки с проверкой
        for i in range(max_scrolls - 2):
            self.driver.swipe(start_x, start_y, start_x, end_y, 300)
            time.sleep(0.05)  # Минимальная пауза
            
            if self.is_displayed_multiple(self.LOGOUT_BUTTON, timeout=0.2):  # Уменьшено с 0.3 до 0.2
                return self
        
        # Если все еще не найдена, пробуем более агрессивную прокрутку
        start_y = size['height'] * 0.9
        end_y = size['height'] * 0.1
        for i in range(2):
            self.driver.swipe(start_x, start_y, start_x, end_y, 500)
            time.sleep(0.05)  # Минимальная пауза
            
            if self.is_displayed_multiple(self.LOGOUT_BUTTON, timeout=0.2):  # Уменьшено с 0.3 до 0.2
                return self
        
        return self

