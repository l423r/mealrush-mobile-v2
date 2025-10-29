"""
Базовый класс для Page Object Pattern
"""
import os
import sys
import time
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
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, EXPLICIT_WAIT)
        self.driver.implicitly_wait(IMPLICIT_WAIT)
    
    def find_element(self, locator, timeout=EXPLICIT_WAIT):
        """Находит элемент с явным ожиданием"""
        try:
            by_type, value = locator
            if isinstance(by_type, str):
                # Для Appium By
                element = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_element_located((by_type, value))
                )
            else:
                # Для стандартных Selenium By
                element = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_element_located(locator)
                )
            return element
        except TimeoutException:
            self.take_screenshot(f"element_not_found_{locator[1]}")
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
        element.clear()
        element.send_keys(text)
    
    def is_displayed_multiple(self, locators, timeout=EXPLICIT_WAIT):
        """Проверяет видимость элемента используя несколько локаторов"""
        if isinstance(locators, tuple):
            return self.is_displayed(locators, timeout)
        
        for locator in locators:
            try:
                if self.is_displayed(locator, timeout=2):
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
    
    def take_screenshot(self, name=None):
        """Делает скриншот"""
        if name is None:
            name = f"screenshot_{get_timestamp()}"
        screenshot_path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
        self.driver.save_screenshot(screenshot_path)
        print(f"Screenshot saved: {screenshot_path}")
        return screenshot_path
    
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

