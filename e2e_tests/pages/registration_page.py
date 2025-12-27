"""
Page Object для экрана регистрации
"""
import os
import sys
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class RegistrationPage(BasePage):
    """Класс для работы с экраном регистрации"""
    
    # Locators - используем XPATH так как accessibility ID отсутствуют в SimpleRegistrationScreen
    NAME_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'ваше имя') or contains(@hint, 'Введите ваше имя')]"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваше имя']"),
        (By.XPATH, "//android.widget.EditText[contains(@content-desc, 'name') or contains(@content-desc, 'Name')]")
    ]
    EMAIL_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'ваш email') or contains(@hint, 'Введите ваш email')]"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите ваш email']"),
        (By.XPATH, "//android.widget.EditText[contains(@content-desc, 'email') or contains(@content-desc, 'Email')]")
    ]
    PASSWORD_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Введите пароль') and not(contains(@hint, 'Повторите'))]"),
        (By.XPATH, "//android.widget.EditText[@hint='Введите пароль']"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'пароль') and not(contains(@hint, 'Подтвердите')) and not(contains(@hint, 'Повторите'))]")
    ]
    CONFIRM_PASSWORD_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Повторите пароль') or contains(@hint, 'Подтвердите')]"),
        (By.XPATH, "//android.widget.EditText[@hint='Повторите пароль']"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'подтвердите') or contains(@hint, 'повторите')]")
    ]
    CREATE_ACCOUNT_BUTTON = [
        (By.XPATH, "//android.widget.TextView[@text='Создать аккаунт']/.."),  # Основной - родительский TouchableOpacity
        (By.XPATH, "//*[@text='Создать аккаунт' and @clickable='true']"),  # Кликабельный элемент с текстом
        (By.XPATH, "//*[@text='Создать аккаунт']"),  # Fallback - любой элемент с текстом
        (By.XPATH, "//android.widget.Button[@text='Создать аккаунт']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Создать аккаунт')]")
    ]
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),  # Основной - текст кнопки назад в Header
        (By.XPATH, "//android.widget.TextView[@text='←']/.."),  # TouchableOpacity с текстом
        (By.XPATH, "//android.widget.Button[contains(@content-desc, 'back') or contains(@content-desc, 'Back')]")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.CREATE_ACCOUNT_BUTTON
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница регистрации"""
        # Проверяем наличие кнопки "Создать аккаунт" - основной индикатор страницы
        if timeout is not None:
            return self.is_displayed_multiple(self.CREATE_ACCOUNT_BUTTON, timeout=timeout)
        return self.is_displayed_multiple(self.CREATE_ACCOUNT_BUTTON)
    
    def is_page_loaded_fast(self, timeout=2):
        """Быстрая проверка страницы регистрации с указанным таймаутом"""
        try:
            # Используем только первый локатор для быстрой проверки
            return self.is_displayed(self.CREATE_ACCOUNT_BUTTON[0], timeout=timeout)
        except:
            return False
    
    def enter_name(self, name):
        """Вводит имя"""
        self.send_keys_multiple(self.NAME_INPUT, name)
        return self
    
    def enter_email(self, email):
        """Вводит email"""
        self.send_keys_multiple(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password):
        """Вводит пароль"""
        self.send_keys_multiple(self.PASSWORD_INPUT, password)
        return self
    
    def enter_confirm_password(self, password):
        """Вводит подтверждение пароля"""
        self.send_keys_multiple(self.CONFIRM_PASSWORD_INPUT, password)
        return self
    
    def click_create_account(self):
        """Кликает на кнопку создания аккаунта"""
        # Используем click_multiple, который попробует все локаторы по порядку
        self.click_multiple(self.CREATE_ACCOUNT_BUTTON)
        # Минимальная задержка для обработки клика
        time.sleep(0.2)  # Уменьшено с 0.5 до 0.2
        return self
    
    def click_back(self):
        """Кликает на кнопку назад или использует системную кнопку назад"""
        try:
            # Пытаемся найти и кликнуть кнопку назад в UI
            self.click_multiple(self.BACK_BUTTON, timeout=2)
        except Exception:
            # Если кнопка не найдена, используем системную кнопку назад
            try:
                self.driver.back()
            except Exception:
                # Если приложение упало, просто возвращаем SignInPage
                pass
        time.sleep(0.5)
        # Возвращаем объект страницы входа
        from pages.sign_in_page import SignInPage
        return SignInPage(self.driver)
    
    def register(self, name, email, password, confirm_password=None):
        """Выполняет полный процесс регистрации
        
        Args:
            name: Имя пользователя
            email: Email пользователя
            password: Пароль
            confirm_password: Подтверждение пароля (если None, используется password)
        """
        self.enter_name(name)
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(confirm_password if confirm_password is not None else password)
        self.click_create_account()
        self.take_screenshot('after_registration')
        return self
    
    def get_error_message(self):
        """Получает сообщение об ошибке, если оно есть"""
        try:
            # Ищем различные варианты сообщений об ошибках
            error_patterns = [
                "//*[contains(@text, 'Ошибка') or contains(@text, 'ошибка')]",
                "//*[contains(@text, 'Error') or contains(@text, 'error')]",
                "//*[contains(@text, 'уже зарегистрирован') or contains(@text, 'already registered')]",
                "//*[contains(@text, 'не совпадают') or contains(@text, 'не совпадают')]",
                "//*[contains(@text, 'должен содержать') or contains(@text, 'must contain')]",
                "//*[contains(@text, 'некорректный') or contains(@text, 'invalid')]"
            ]
            for pattern in error_patterns:
                error_locator = (By.XPATH, pattern)
                error_text = self.get_text(error_locator)
                if error_text:
                    return error_text
            return None
        except Exception:
            return None
    
    def is_error_displayed(self):
        """Проверяет, отображается ли ошибка на странице"""
        return self.get_error_message() is not None
    
    def is_still_on_registration_page(self, timeout=2):
        """Проверяет, остались ли мы на странице регистрации"""
        return self.is_displayed_multiple(self.CREATE_ACCOUNT_BUTTON, timeout=timeout)
    
    def is_still_on_registration_page_fast(self, timeout=0.5):
        """Быстрая проверка страницы регистрации без скриншотов"""
        try:
            from selenium.common.exceptions import NoSuchElementException
            
            # Получаем текущий implicit wait перед изменением
            try:
                original_implicit_wait = self.driver.timeouts.implicit_wait / 1000  # Конвертируем из миллисекунд в секунды
            except:
                original_implicit_wait = 0
            
            # Устанавливаем небольшой таймаут для проверки
            self.driver.implicitly_wait(0.1)
            try:
                print(f"    [DEBUG] Начало проверки страницы регистрации")
                
                # Проверяем несколько индикаторов страницы регистрации для надежности
                
                # 1. Проверяем заголовок "Регистрация" (самый надежный индикатор)
                try:
                    print(f"    [DEBUG] Проверка заголовка 'Регистрация'...")
                    element = self.driver.find_element(By.XPATH, "//*[@text='Регистрация']")
                    if element:
                        print(f"    [DEBUG] ✓ Заголовок 'Регистрация' найден!")
                        return True
                except NoSuchElementException as e:
                    print(f"    [DEBUG] ✗ Заголовок 'Регистрация' не найден")
                
                # 2. Проверяем текст "Добро пожаловать!" (уникальный для страницы регистрации)
                try:
                    print(f"    [DEBUG] Проверка текста 'Добро пожаловать!'...")
                    element = self.driver.find_element(By.XPATH, "//*[@text='Добро пожаловать!']")
                    if element:
                        print(f"    [DEBUG] ✓ Текст 'Добро пожаловать!' найден!")
                        return True
                except NoSuchElementException:
                    print(f"    [DEBUG] ✗ Текст 'Добро пожаловать!' не найден")
                
                # 3. Проверяем поле ввода имени (уникальное для страницы регистрации)
                try:
                    print(f"    [DEBUG] Проверка поля ввода имени...")
                    element = self.driver.find_element(*self.NAME_INPUT[0])
                    if element:
                        print(f"    [DEBUG] ✓ Поле ввода имени найдено!")
                        return True
                except NoSuchElementException:
                    print(f"    [DEBUG] ✗ Поле ввода имени не найдено")
                
                # 4. Проверяем кнопку "Создать аккаунт" (последний вариант)
                for i, locator in enumerate(self.CREATE_ACCOUNT_BUTTON[:2]):  # Проверяем первые 2 локатора
                    try:
                        print(f"    [DEBUG] Проверка кнопки 'Создать аккаунт' (локатор {i+1})...")
                        element = self.driver.find_element(*locator)
                        if element:
                            print(f"    [DEBUG] ✓ Кнопка 'Создать аккаунт' найдена (локатор {i+1})!")
                            return True
                    except NoSuchElementException:
                        print(f"    [DEBUG] ✗ Кнопка 'Создать аккаунт' не найдена (локатор {i+1})")
                        continue
                
                print(f"    [DEBUG] ✗ Все проверки не прошли - не на странице регистрации")
                return False
            finally:
                # Восстанавливаем original implicit wait
                try:
                    self.driver.implicitly_wait(original_implicit_wait)
                except:
                    pass
        except Exception as e:
            print(f"    [DEBUG] ✗ Ошибка при проверке страницы регистрации: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def close_modal_dialog(self):
        """Закрывает модальное окно/диалог, нажимая кнопку 'ОК' (очень быстрая проверка без скриншотов)"""
        try:
            # Очень быстрая проверка - только первый локатор с минимальным таймаутом
            # Используем прямой поиск без скриншотов при ошибке
            try:
                from selenium.webdriver.support.ui import WebDriverWait
                from selenium.webdriver.support import expected_conditions as EC
                element = WebDriverWait(self.driver, 0.1).until(
                    EC.presence_of_element_located((By.XPATH, "//*[@text='ОК' and @clickable='true']"))
                )
                if element and element.is_displayed():
                    element.click()
                    time.sleep(0.1)
                    return True
            except:
                pass
        except:
            pass
        return False
    
    def ensure_form_ready(self, timeout=2):
        """Убеждается, что форма регистрации готова к вводу данных
        
        Закрывает возможные диалоги ошибок и проверяет доступность полей ввода
        """
        # Сначала закрываем возможные диалоги (очень быстро)
        self.close_modal_dialog()
        time.sleep(0.1)  # Уменьшено с 0.3 до 0.1
        
        # Быстрая проверка, что мы на странице регистрации (используем только первый локатор)
        try:
            if not self.is_displayed(self.CREATE_ACCOUNT_BUTTON[0], timeout=timeout):
                return False
        except:
            return False
        
        # Проверяем, что поле ввода имени доступно (быстрая проверка)
        try:
            return self.is_displayed(self.NAME_INPUT[0], timeout=1)
        except:
            return False
    
    def navigate_to_registration_from_sign_in(self):
        """Навигация на страницу регистрации со страницы входа
        
        Используется для восстановления формы после ошибок
        """
        from pages.sign_in_page import SignInPage
        sign_in_page = SignInPage(self.driver)
        
        # Закрываем возможные диалоги перед проверкой (быстро)
        self.close_modal_dialog()
        time.sleep(0.1)
        
        # Используем быстрые методы проверки (без скриншотов)
        is_on_registration = self.is_still_on_registration_page_fast(timeout=0.2)
        if is_on_registration:
            # Уже на странице регистрации
            return self
        
        is_on_sign_in = sign_in_page.is_on_sign_in_page_fast(timeout=0.2)
        if not is_on_sign_in:
            # Не на странице входа и не на регистрации - пытаемся вернуться назад
            try:
                self.driver.back()
                time.sleep(0.2)
                # Проверяем снова
                is_on_sign_in = sign_in_page.is_on_sign_in_page_fast(timeout=0.2)
            except:
                pass
        
        # Если на странице входа, переходим на регистрацию
        if is_on_sign_in:
            return sign_in_page.click_register_button()
        
        # Если все еще не на странице входа, пытаемся найти кнопку регистрации напрямую
        try:
            # Пытаемся найти кнопку регистрации и кликнуть
            register_button = sign_in_page.REGISTER_BUTTON
            self.click_multiple(register_button, timeout=1)  # Уменьшено с 2 до 1
            time.sleep(0.3)  # Уменьшено с 0.5 до 0.3
            # Проверяем, что мы на странице регистрации (быстрая проверка)
            if self.is_still_on_registration_page_fast(timeout=0.3):
                return self
        except:
            pass
        
        # Стандартный путь: через SignInPage
        return sign_in_page.click_register_button()

