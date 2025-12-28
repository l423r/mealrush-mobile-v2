"""
Базовый класс для Page Object Pattern
"""
import os
import sys
import time
import threading
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.appium_config import EXPLICIT_WAIT, IMPLICIT_WAIT, SCREENSHOT_DIR, get_timestamp


class BasePage:
    """Базовый класс для всех страниц"""
    
    # Классовая переменная для счетчика скриншотов
    _screenshot_counter = {}
    # Thread-local storage для хранения текущей директории теста
    _local = threading.local()
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, EXPLICIT_WAIT)
        self.driver.implicitly_wait(IMPLICIT_WAIT)
    
    @classmethod
    def set_test_dir(cls, test_dir):
        """Устанавливает директорию для скриншотов текущего теста"""
        cls._local.test_dir = test_dir
    
    @classmethod
    def get_test_dir(cls):
        """Получает директорию для скриншотов текущего теста"""
        return getattr(cls._local, 'test_dir', None)
    
    def find_element(self, locator, timeout=EXPLICIT_WAIT):
        """Находит элемент с явным ожиданием
        
        Args:
            locator: Кортеж (by_type, value) или список кортежей
            timeout: Таймаут ожидания
        """
        try:
            # Если передан список локаторов, используем find_element_multiple
            if isinstance(locator, list):
                return self.find_element_multiple(locator, timeout)
            
            # Ожидаем кортеж (by_type, value)
            by_type, value = locator
            # Используем locator напрямую - WebDriverWait правильно обработает и AppiumBy, и стандартный By
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            return element
        except TimeoutException:
            # Безопасно получаем значение для скриншота
            value_str = locator[1] if isinstance(locator, (tuple, list)) and len(locator) > 1 else "unknown"
            self.take_screenshot(f"element_not_found_{value_str}")
            raise
    
    def find_elements(self, locator, timeout=EXPLICIT_WAIT):
        """Находит все элементы"""
        try:
            by_type, value = locator
            elements = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_all_elements_located(locator)
            )
            return elements
        except TimeoutException:
            return []
    
    def click(self, locator, timeout=EXPLICIT_WAIT):
        """Кликает на элемент"""
        element = self.find_element(locator, timeout)
        element.click()
        time.sleep(0.5)  # Небольшая пауза для стабильности
    
    def send_keys(self, locator, text, timeout=EXPLICIT_WAIT):
        """Вводит текст в поле"""
        element = self.find_element(locator, timeout)
        element.clear()
        element.send_keys(text)
    
    def get_text(self, locator, timeout=EXPLICIT_WAIT):
        """Получает текст элемента"""
        element = self.find_element(locator, timeout)
        return element.text
    
    def is_displayed(self, locator, timeout=EXPLICIT_WAIT):
        """Проверяет видимость элемента"""
        try:
            element = self.find_element(locator, timeout)
            return element.is_displayed()
        except TimeoutException:
            return False
    
    def find_element_multiple(self, locators, timeout=EXPLICIT_WAIT):
        """Пытается найти элемент используя несколько локаторов (fallback)"""
        if isinstance(locators, tuple):
            # Один локатор - используем обычный метод
            return self.find_element(locators, timeout)
        
        # Множество локаторов - пробуем каждый
        last_exception = None
        for locator in locators:
            try:
                return self.find_element(locator, timeout=2)
            except Exception as e:
                last_exception = e
                continue
        
        # Если ни один не сработал, выбрасываем последнюю ошибку
        raise last_exception
    
    def click_multiple(self, locators, timeout=EXPLICIT_WAIT):
        """Кликает на элемент используя несколько локаторов"""
        element = self.find_element_multiple(locators, timeout)
        element.click()
        time.sleep(0.5)
    
    def send_keys_multiple(self, locators, text, timeout=EXPLICIT_WAIT):
        """Вводит текст используя несколько локаторов"""
        element = self.find_element_multiple(locators, timeout)
        # Быстрая очистка поля - используем set_value для Appium (быстрее чем clear())
        try:
            # Для Appium используем set_value - это быстрее чем clear() + send_keys()
            element.set_value(text)
        except:
            # Fallback на обычный способ, но с минимальными задержками
            try:
                element.clear()
            except:
                pass
        element.send_keys(text)
    
    def is_displayed_multiple(self, locators, timeout=EXPLICIT_WAIT):
        """Проверяет видимость элемента используя несколько локаторов"""
        if isinstance(locators, tuple):
            return self.is_displayed(locators, timeout)
        
        # Используем меньший timeout для каждого локатора, но не больше общего timeout
        single_timeout = min(2, timeout / len(locators)) if locators else 2
        for locator in locators:
            try:
                if self.is_displayed(locator, timeout=single_timeout):
                    return True
            except:
                continue
        return False
    
    def wait_for_element_invisible(self, locator, timeout=EXPLICIT_WAIT):
        """Ожидает исчезновения элемента"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False
    
    def scroll_to_element(self, locator):
        """Прокручивает к элементу"""
        element = self.find_element(locator)
        self.driver.execute_script('mobile: scroll', {
            'element': element,
            'direction': 'down'
        })
    
    def swipe_up(self, duration=1000):
        """Свайп вверх"""
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        start_y = size['height'] * 0.8
        end_y = size['height'] * 0.2
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)
    
    def swipe_down(self, duration=1000):
        """Свайп вниз"""
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        start_y = size['height'] * 0.2
        end_y = size['height'] * 0.8
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)
    
    def tap(self, x, y):
        """Тап по координатам"""
        self.driver.tap([(x, y)], 500)
    
    def take_screenshot(self, name=None, test_dir=None):
        """Делает скриншот с нумерацией
        
        Args:
            name: Имя скриншота (без расширения)
            test_dir: Директория теста (если None, используется из thread-local или SCREENSHOT_DIR)
        """
        # Используем переданную директорию, или из thread-local, или общую
        if test_dir is None:
            test_dir = BasePage.get_test_dir()
        screenshot_base_dir = test_dir if test_dir else SCREENSHOT_DIR
        
        # Получаем или инициализируем счетчик для текущего теста
        test_key = screenshot_base_dir
        if test_key not in BasePage._screenshot_counter:
            BasePage._screenshot_counter[test_key] = 0
        
        # Увеличиваем счетчик
        BasePage._screenshot_counter[test_key] += 1
        counter = BasePage._screenshot_counter[test_key]
        
        # Формируем имя файла с нумерацией
        if name is None:
            name = f"screenshot_{counter:02d}"
        else:
            name = f"{counter:02d}_{name}"
        
        screenshot_path = os.path.join(screenshot_base_dir, f"{name}.png")
        
        # Создаем директорию если не существует
        os.makedirs(screenshot_base_dir, exist_ok=True)
        
        try:
            self.driver.save_screenshot(screenshot_path)
            print(f"Screenshot saved: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            # Если не удалось сделать скриншот (например, приложение упало), логируем, но не прерываем выполнение
            print(f"Warning: Could not take screenshot '{name}': {e}")
            return None
    
    def wait_for_activity(self, activity_name, timeout=EXPLICIT_WAIT):
        """Ожидает появления активности (Android)"""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda driver: activity_name in driver.current_activity
            )
            return True
        except TimeoutException:
            return False
    
    def wait_for_page_load(self, element_locator, timeout=EXPLICIT_WAIT):
        """Ожидает загрузки страницы по элементу"""
        try:
            self.find_element(element_locator, timeout)
            return True
        except TimeoutException:
            return False
    
    def hide_keyboard(self):
        """Скрывает клавиатуру"""
        try:
            self.driver.hide_keyboard()
        except Exception:
            pass

