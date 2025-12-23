"""
Page Object для экрана настройки профиля (ProfileSetup)
"""
import os
import sys
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class ProfileSetupPage(BasePage):
    """Класс для работы с экраном настройки профиля (выбор пола и другие шаги)"""
    
    # Locators для экрана выбора пола
    GENDER_SELECTION_TITLE = [
        (By.XPATH, "//*[@text='Выберите пол' or contains(@text, 'Выберите пол')]"),
        (By.XPATH, "//*[contains(@text, 'Какой у вас пол')]")
    ]
    MALE_BUTTON = [
        (By.XPATH, "//*[@text='Мужской' or contains(@text, 'Мужской')]"),
        (By.XPATH, "//*[contains(@text, 'Мужской')]")
    ]
    FEMALE_BUTTON = [
        (By.XPATH, "//*[@text='Женский' or contains(@text, 'Женский')]"),
        (By.XPATH, "//*[contains(@text, 'Женский')]")
    ]
    NEXT_BUTTON = [
        (By.XPATH, "//*[@text='Далее' or contains(@text, 'Далее')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Далее')]")
    ]
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    # Locators для кнопки выхода (в правом верхнем углу Header)
    LOGOUT_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "profile_setup_logout_button"),  # Основной - работает!
        (By.XPATH, "//*[@content-desc='profile_setup_logout_button']"),  # Fallback
    ]
    # Locators для модального окна подтверждения выхода
    LOGOUT_CONFIRM_DIALOG = [
        (By.XPATH, "//*[@text='Выход' or contains(@text, 'Выход')]"),
        (By.XPATH, "//android.widget.TextView[@text='Выход']"),
    ]
    LOGOUT_CONFIRM_BUTTON = [
        (By.XPATH, "//*[@text='Подтвердить' or contains(@text, 'Подтвердить')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Подтвердить')]"),
        (By.XPATH, "//*[contains(@text, 'Подтвердить')]/.."),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница настройки профиля (экран выбора пола)"""
        if timeout is not None:
            return self.is_displayed_multiple(self.GENDER_SELECTION_TITLE, timeout=timeout)
        return self.is_displayed_multiple(self.GENDER_SELECTION_TITLE)
    
    def select_gender(self, gender='male'):
        """Выбирает пол: 'male' или 'female'"""
        if gender.lower() == 'male' or gender.lower() == 'мужской':
            self.click_multiple(self.MALE_BUTTON)
        else:
            self.click_multiple(self.FEMALE_BUTTON)
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
    
    def click_logout_button(self):
        """Кликает на кнопку выхода из аккаунта (иконка в правом верхнем углу)"""
        self.click_multiple(self.LOGOUT_BUTTON)
        time.sleep(1)  # Даем время на появление диалога подтверждения
        return self
    
    def confirm_logout(self):
        """Подтверждает выход из аккаунта в диалоге"""
        try:
            # Проверяем, что диалог появился
            self.is_displayed_multiple(self.LOGOUT_CONFIRM_DIALOG, timeout=3)
            # Кликаем на кнопку подтверждения
            self.click_multiple(self.LOGOUT_CONFIRM_BUTTON)
            time.sleep(2)  # Даем время на выполнение logout и переход на экран входа
            return self
        except Exception as e:
            print(f"Warning: Could not confirm logout: {e}")
            return self
    
    
    def logout(self):
        """Выполняет полный процесс выхода из аккаунта"""
        from pages.sign_in_page import SignInPage
        
        self.click_logout_button()
        self.confirm_logout()
        # После logout должно произойти перенаправление на экран входа
        sign_in_page = SignInPage(self.driver)
        return sign_in_page
    
    def go_back_to_sign_in(self):
        """Возвращается на страницу входа, используя кнопку выхода
        
        Использует кнопку выхода из аккаунта для возврата на страницу входа.
        """
        from pages.sign_in_page import SignInPage
        
        try:
            # Используем кнопку выхода для возврата на страницу входа
            self.logout()
            sign_in_page = SignInPage(self.driver)
            if sign_in_page.is_page_loaded(timeout=5):
                return sign_in_page
        except Exception as e:
            print(f"Warning: Could not logout to return to sign in page: {e}")
        
        # Fallback: используем reset приложения, если logout не сработал
        try:
            self.driver.reset()
            time.sleep(5)  # Даем время на перезапуск приложения
            sign_in_page = SignInPage(self.driver)
            return sign_in_page
        except Exception as e:
            print(f"Warning: Could not reset app to return to sign in page: {e}")
            return SignInPage(self.driver)

