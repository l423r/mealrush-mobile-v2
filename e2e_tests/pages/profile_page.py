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
    SETTINGS_BUTTON = (By.XPATH, "//*[@content-desc='⚙️' or contains(@content-desc, 'Настройки')]")
    LOGOUT_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Выйти') or contains(@text-east, 'Выход')]")
    LOGOUT_CONFIRM_BUTTON = (By.XPATH, "//*[contains(@text, 'Выйти')]/parent::*/following-sibling::*/android.widget.Button[contains(@text, 'Выйти')]")
    USER_NAME = (By.XPATH, "//android.widget.TextView[contains(@text, 'USER') or contains(@text, 'User')]")
    BMI_VALUE = (By.XPATH, "//android.widget.TextView[contains(@text, 'ИМТ') or contains(@text, 'BMI')]/following-sibling::android.widget.TextView")
    CALORIES_GOAL = (By.XPATH, "//choose_following[contains(@text, 'ккал')]/ancestor::android.view.ViewGroup//android.widget.TextView[1]")
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self):
        """Проверяет, загрузилась ли страница профиля"""
        return self.is_displayed(self.SETTINGS_BUTTON, timeout=20)
    
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
        self.click(self.LOGOUT_BUTTON)
        time.sleep(1)
        # Подтверждаем выход
        try:
            self.click(self.LOGOUT_CONFIRM_BUTTON)
            time.sleep(2)
        except Exception:
            pass
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
    
    def scroll_to_logout(self):
        """Прокручивает до кнопки выхода"""
        self.swipe_up()
        time.sleep(1)
        return self

