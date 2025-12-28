"""
Page Object для главного экрана (Home)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MainPage(BasePage):
    """Класс для работы с главным экраном"""
    
    # Locators
    ADD_MEAL_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить прием пищи')]")
    DATE_PREV_BUTTON = (By.XPATH, "//*[contains(@content-desc, '‹') or contains(@text, '‹')]")
    DATE_NEXT_BUTTON = (By.XPATH, "//*[contains(@content-desc, '›') or contains(@text, '›')]")
    MEAL_CARD = (By.XPATH, "//*[contains(@content-desc, 'ккал') or contains(@text, 'ккал')]")
    DAILY_CALORIES = (By.XPATH, "//*[contains(@text, 'ккал')]/parent::*//preceding-sibling::*[1]")
    NAVIGATION_TABS = (By.XPATH, "//android.widget.TabWidget/*")
    
    # Локаторы для bottom navigation
    PROFILE_TAB = [
        (By.XPATH, "//*[@text='Профиль' or contains(@text, 'Профиль')]"),
        (By.XPATH, "//*[@content-desc='Профиль' or contains(@content-desc, 'Профиль')]"),
        (By.XPATH, "//android.widget.TabWidget//*[contains(@text, 'Профиль')]"),
    ]
    SEARCH_TAB = (By.XPATH, "//*[@content-desc='Поиск']")
    HOME_TAB = (By.XPATH, "//*[@content-desc='Главная']")
    
    # Альтернативные локаторы для проверки главного экрана
    MAIN_SCREEN_INDICATORS = [
        (By.XPATH, "//*[@text='Расписание' or contains(@text, 'Расписание')]"),
        (By.XPATH, "//*[@text='Приемы пищи' or contains(@text, 'Приемы пищи')]"),
        (By.XPATH, "//*[@text='Сегодня' or contains(@text, 'Сегодня')]"),
        (By.XPATH, "//*[@text='Сводка питания' or contains(@text, 'Сводка питания')]"),
        (By.XPATH, "//*[contains(@text, 'Нет приемов пищи')]"),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.ADD_MEAL_BUTTON
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли главная страница"""
        # Проверяем несколько индикаторов главного экрана
        if timeout is None:
            timeout = 10
        
        # Сначала проверяем основные индикаторы
        for indicator in self.MAIN_SCREEN_INDICATORS:
            try:
                if self.is_displayed(indicator, timeout=2):
                    return True
            except:
                continue
        
        # Затем проверяем кнопку добавления приема пищи (может отсутствовать на пустом экране)
        try:
            if self.is_displayed(self.ADD_MEAL_BUTTON, timeout=2):
                return True
        except:
            pass
        
        # Проверяем наличие bottom navigation (всегда должен быть)
        try:
            if self.is_displayed_multiple(self.PROFILE_TAB, timeout=2):
                return True
        except:
            pass
        
        return False
    
    def is_on_main_page_fast(self, timeout=1.5):
        """Быстрая проверка главного экрана без скриншотов при ошибке (максимум 1.5 секунды)"""
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
                print(f"    [DEBUG] Начало проверки главного экрана")
                
                # Используем прямой поиск элементов с небольшим ожиданием
                # Проверяем несколько надежных индикаторов последовательно
                
                # 1. Проверяем заголовок "Расписание" (самый надежный индикатор)
                try:
                    print(f"    [DEBUG] Проверка заголовка 'Расписание'...")
                    element = self.driver.find_element(By.XPATH, "//*[@text='Расписание']")
                    if element:
                        print(f"    [DEBUG] ✓ Заголовок 'Расписание' найден!")
                        return True
                except NoSuchElementException:
                    print(f"    [DEBUG] ✗ Заголовок 'Расписание' не найден")
                
                # 2. Проверяем bottom navigation - вкладку "Профиль" (всегда есть на главном экране)
                try:
                    print(f"    [DEBUG] Проверка вкладки 'Профиль'...")
                    element = self.driver.find_element(By.XPATH, "//*[contains(@text, 'Профиль')]")
                    if element:
                        print(f"    [DEBUG] ✓ Вкладка 'Профиль' найдена!")
                        return True
                except NoSuchElementException:
                    print(f"    [DEBUG] ✗ Вкладка 'Профиль' не найдена")
                
                # 3. Проверяем вкладку "Главная" в bottom navigation
                try:
                    print(f"    [DEBUG] Проверка вкладки 'Главная'...")
                    element = self.driver.find_element(*self.HOME_TAB)
                    if element:
                        print(f"    [DEBUG] ✓ Вкладка 'Главная' найдена!")
                        return True
                except NoSuchElementException:
                    print(f"    [DEBUG] ✗ Вкладка 'Главная' не найдена")
                
                print(f"    [DEBUG] ✗ Все проверки не прошли - не на главном экране")
                # Если ничего не найдено - не главный экран
                return False
            finally:
                # Восстанавливаем original implicit wait
                try:
                    self.driver.implicitly_wait(original_implicit_wait)
                except:
                    pass
        except Exception as e:
            print(f"    [DEBUG] ✗ Ошибка при проверке главного экрана: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def click_add_meal_button(self):
        """Кликает на кнопку добавления приема пищи"""
        self.click(self.ADD_MEAL_BUTTON)
        time.sleep(2)
        return self
    
    def change_date(self, direction='next'):
        """Меняет дату (prev/next)"""
        if direction == 'prev':
            self.click(self.DATE_PREV_BUTTON)
        else:
            self.click(self.DATE_NEXT_BUTTON)
        time.sleep(1)
        return self
    
    def get_daily_calories(self):
        """Получает значение дневных калорий"""
        try:
            text = self.get_text(self.DAILY_CALORIES)
            # Извлекаем только число
            import re
            numbers = re.findall(r'\d+', text)
            return int(numbers[0]) if numbers else 0
        except Exception:
            return 0
    
    def get_meals_count(self):
        """Получает количество приемов пищи"""
        try:
            meals = self.find_elements(self.MEAL_CARD)
            return len(meals)
        except Exception:
            return 0
    
    def click_meal_card(self, index=0):
        """Кликает на карточку приема пищи по индексу"""
        meals = self.find_elements(self.MEAL_CARD)
        if meals and index < len(meals):
            meals[index].click()
            time.sleep(2)
        return self
    
    def navigate_to_profile(self):
        """Переходит на вкладку профиля"""
        try:
            # Пробуем найти и кликнуть на вкладку профиля
            self.click_multiple(self.PROFILE_TAB, timeout=5)
            time.sleep(3)  # Увеличено время ожидания для перехода
            return self
        except Exception as e:
            print(f"Warning: Could not click profile tab using standard method: {e}")
            # Альтернативный способ - ищем по тексту в bottom navigation
            try:
                from appium.webdriver.common.appiumby import AppiumBy
                profile_tab = self.driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 
                    'new UiSelector().text("Профиль")')
                profile_tab.click()
                time.sleep(3)
            except Exception as e2:
                print(f"Warning: Could not click profile tab using alternative method: {e2}")
                raise
        return self
    
    def navigate_to_search(self):
        """Переходит на вкладку поиска"""
        self.click(self.SEARCH_TAB)
        time.sleep(2)
        return self
    
    def navigate_to_home(self):
        """Переходит на вкладку главной"""
        self.click(self.HOME_TAB)
        time.sleep(2)
        return self
    
    def wait_for_meals_loaded(self, timeout=20):
        """Ожидает загрузки приемов пищи"""
        try:
            self.find_element(self.ADD_MEAL_BUTTON, timeout)
            return True
        except Exception:
            return False

