"""
Page Object для экрана входа (Sign In)
"""
import os
import sys
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class SignInPage(BasePage):
    """Класс для работы с экраном входа"""
    
    # Locators - оптимизированы на основе диагностических тестов
    # AppiumBy.ACCESSIBILITY_ID работает отлично! Используем его как основной способ
    # Убран неработающий By.ID
    
    EMAIL_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_email_input"),  # Основной - работает!
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш email']")  # Fallback
    ]
    
    PASSWORD_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_password_input"),  # Основной - работает!
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш пароль']")  # Fallback
    ]
    
    LOGIN_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_login_button"),  # Основной - работает!
        (By.XPATH, "//*[@text='Войти']")  # Fallback
    ]
    
    REGISTER_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_register_button"),  # Основной
        (By.XPATH, "//*[@text='Зарегистрироваться']")  # Fallback
    ]
    
    FORGOT_PASSWORD_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "sign_in_forgot_password_button"),  # Основной
        (By.XPATH, "//*[@text='Забыли пароль?']")  # Fallback
    ]
    
    PASSWORD_TOGGLE = [
        (AppiumBy.ACCESSIBILITY_ID, "password_toggle_icon"),  # Основной (будет работать после обновления)
        (By.XPATH, "//*[@text='👁️' or @text='👁️‍🗨️']")  # Fallback - работает!
    ]
    
    # Locators для модального окна/диалога
    MODAL_OK_BUTTON = [
        (By.XPATH, "//*[@text='ОК' or @text='OK']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'ОК')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'OK')]"),
        (By.XPATH, "//*[@resource-id='android:id/button1']"),  # Стандартная кнопка OK в Android диалогах
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.LOGIN_BUTTON
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница входа"""
        if timeout is not None:
            return self.is_displayed_multiple(self.LOGIN_BUTTON, timeout=timeout)
        return self.is_displayed_multiple(self.LOGIN_BUTTON)
    
    def is_page_loaded_fast(self, timeout=1):
        """Быстрая проверка страницы входа с коротким таймаутом"""
        # Используем только первый (основной) локатор для быстрой проверки
        try:
            return self.is_displayed(self.LOGIN_BUTTON[0], timeout=timeout)
        except:
            return False
    
    def enter_email(self, email):
        """Вводит email"""
        self.send_keys_multiple(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password):
        """Вводит пароль"""
        self.send_keys_multiple(self.PASSWORD_INPUT, password)
        return self
    
    def toggle_password_visibility(self):
        """Переключает видимость пароля"""
        self.click_multiple(self.PASSWORD_TOGGLE)
        return self
    
    def click_login_button(self):
        """Кликает на кнопку входа"""
        self.click_multiple(self.LOGIN_BUTTON)
        # Ожидаем перехода на другой экран
        time.sleep(2)
        return self
    
    def click_register_button(self):
        """Кликает на кнопку регистрации"""
        # Делаем скриншот перед кликом для диагностики
        self.take_screenshot('before_click_register')
        self.click_multiple(self.REGISTER_BUTTON)
        # Даем время на загрузку страницы регистрации
        time.sleep(2)  # Уменьшено с 3 до 2, так как проверка делается в тесте с таймаутом
        # Возвращаем объект страницы регистрации
        from pages.registration_page import RegistrationPage
        return RegistrationPage(self.driver)
    
    def click_forgot_password(self):
        """Кликает на кнопку 'Забыли пароль'"""
        self.click_multiple(self.FORGOT_PASSWORD_BUTTON)
        return self
    
    def close_modal_dialog(self):
        """Закрывает модальное окно/диалог, нажимая кнопку 'ОК'"""
        try:
            # Пытаемся найти и кликнуть кнопку ОК
            self.click_multiple(self.MODAL_OK_BUTTON, timeout=2)
            time.sleep(0.5)
            return True
        except Exception:
            # Если кнопка ОК не найдена, пытаемся закрыть через системную кнопку "Назад"
            try:
                self.driver.back()
                time.sleep(0.5)
                return True
            except Exception:
                return False
    
    def login(self, email, password):
        """Выполняет полный процесс входа"""
        self.enter_email(email)
        self.enter_password(password)
        self.click_login_button()
        self.take_screenshot('after_login')
        return self
    
    def get_error_message(self):
        """Получает сообщение об ошибке, если оно есть"""
        try:
            error_locator = (By.XPATH, "//*[contains(@text, 'Ошибка') or contains(@text, 'ошибка')]")
            return self.get_text(error_locator)
        except Exception:
            return None
    
    @staticmethod
    def ensure_sign_in_page(driver):
        """Проверяет текущее состояние и переходит на страницу входа, если пользователь залогинен"""
        from pages.sign_in_page import SignInPage
        from pages.main_page import MainPage
        from pages.profile_page import ProfilePage
        from pages.profile_setup_page import ProfileSetupPage
        
        sign_in_page = SignInPage(driver)
        
        # Проверяем, не находимся ли мы уже на странице входа
        if sign_in_page.is_page_loaded(timeout=3):
            return sign_in_page
        
        # Проверяем различные возможные состояния
        
        # Вариант 1: На экране настройки профиля (выбор пола) - используем кнопку выхода
        try:
            profile_setup_page = ProfileSetupPage(driver)
            if profile_setup_page.is_page_loaded(timeout=3):
                # Используем кнопку выхода для возврата на страницу входа
                print("On profile setup screen, logging out to return to sign in page...")
                sign_in_page = profile_setup_page.logout()
                if sign_in_page.is_page_loaded(timeout=10):
                    return sign_in_page
        except Exception as e:
            print(f"Warning: Could not logout from profile setup screen: {e}")
            # Fallback: используем reset приложения
            try:
                print("Falling back to app reset...")
                driver.reset()
                time.sleep(5)
                sign_in_page = SignInPage(driver)
                if sign_in_page.is_page_loaded(timeout=10):
                    return sign_in_page
            except Exception as reset_error:
                print(f"Warning: Could not reset app: {reset_error}")
                pass
        
        # Вариант 2: На главном экране
        try:
            main_page = MainPage(driver)
            if main_page.is_page_loaded(timeout=3):
                # Переходим в профиль для логаута
                main_page.navigate_to_profile()
                time.sleep(2)
        except:
            pass
        
        # Вариант 3: На экране профиля - пытаемся сделать логаут
        try:
            profile_page = ProfilePage(driver)
            if profile_page.is_page_loaded(timeout=3):
                profile_page.scroll_to_logout()
                profile_page.click_logout()
                time.sleep(2)
                sign_in_page = SignInPage(driver)
                if sign_in_page.is_page_loaded(timeout=3):
                    return sign_in_page
        except:
            pass
        
        # Если не удалось сделать логаут через UI, используем системную кнопку назад несколько раз
        try:
            for _ in range(10):
                driver.back()
                time.sleep(1)
                sign_in_page = SignInPage(driver)
                if sign_in_page.is_page_loaded(timeout=2):
                    return sign_in_page
        except:
            pass
        
        # Проверяем, что мы на странице входа
        sign_in_page = SignInPage(driver)
        if not sign_in_page.is_page_loaded(timeout=3):
            # Если все еще не на странице входа, перезапускаем приложение
            try:
                driver.reset()
                time.sleep(3)
                sign_in_page = SignInPage(driver)
            except:
                pass
        
        return sign_in_page

