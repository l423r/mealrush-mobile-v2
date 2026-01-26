"""
Page Object для экрана профиля
"""
import os
import sys
import time
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class ProfilePage(BasePage):
    """Класс для работы с экраном профиля"""
    
    # Locators
    EDIT_PROFILE_BUTTON = [
        (AppiumBy.ANDROID_UIAUTOMATOR, 'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("Редактировать профиль"))'),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Редактировать профиль')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Редактировать')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Изменить')]"),
        (By.XPATH, "//*[@text='Редактировать профиль']"),
        (By.XPATH, "//*[contains(@text, 'Редактировать профиль')]"),
    ]
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
    # Локаторы для секции калорийности
    # В коде: "Установленный лимит" и "Рекомендуемый лимит" с значениями в ккал
    # Структура: <View> -> <Text>Установленный лимит</Text> -> <Text>2370 ккал</Text>
    CALORIES_SET_LIMIT = [
        (By.XPATH, "//*[@text='Установленный лимит']/following-sibling::*[contains(@text, 'ккал')]"),
        (By.XPATH, "//*[contains(@text, 'Установленный лимит')]/following-sibling::*[contains(@text, 'ккал')]"),
        (By.XPATH, "//*[@text='Установленный лимит']/../*[contains(@text, 'ккал')]"),
        # Ищем элемент в том же родителе, что и "Установленный лимит"
        (By.XPATH, "//*[@text='Установленный лимит']/parent::*/child::*[contains(@text, 'ккал')]"),
    ]
    CALORIES_RECOMMENDED_LIMIT = [
        # Вариант 1: Ищем элемент в том же родителе (View), что и "Рекомендуемый лимит"
        # Структура: <View calorieItem> -> <Text>Рекомендуемый лимит</Text> -> <Text>2672 ккал</Text>
        (By.XPATH, "//*[@text='Рекомендуемый лимит']/parent::*/child::*[contains(@text, 'ккал')]"),
        # Вариант 2: Ищем в том же родителе через .. (более точный)
        (By.XPATH, "//*[@text='Рекомендуемый лимит']/../*[contains(@text, 'ккал')]"),
        # Вариант 3: Ищем следующий sibling элемент (Text после Text с "Рекомендуемый лимит")
        (By.XPATH, "//*[@text='Рекомендуемый лимит']/following-sibling::*[contains(@text, 'ккал')]"),
        (By.XPATH, "//*[contains(@text, 'Рекомендуемый лимит')]/following-sibling::*[contains(@text, 'ккал')]"),
        # Вариант 4: Ищем второй элемент с "ккал" в секции калорийности (первый - установленный, второй - рекомендованный)
        # ВАЖНО: Этот локатор может найти установленный лимит, если рекомендованный не виден, поэтому он последний
        (By.XPATH, "//*[@text='Калорийность']/ancestor::*//*[contains(@text, 'ккал')][2]"),
    ]
    # Для обратной совместимости
    CALORIES_GOAL = CALORIES_RECOMMENDED_LIMIT
    
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
    
    def scroll_to_edit_profile(self, max_scrolls=8):
        """Прокручивает до кнопки редактирования профиля"""
        start_time = time.time()
        print("[scroll_to_edit_profile] Начинаем поиск кнопки 'Редактировать профиль'")
        
        # Сначала пробуем UiScrollable (самый надежный способ для Android)
        # Пробуем несколько вариантов UiScrollable запросов
        ui_scrollable_queries = [
            'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("Редактировать профиль"))',
            'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Редактировать профиль"))',
            'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("Редактировать"))',
        ]
        
        print(f"[scroll_to_edit_profile] Пробуем {len(ui_scrollable_queries)} вариантов UiScrollable")
        for idx, query in enumerate(ui_scrollable_queries):
            try:
                print(f"[scroll_to_edit_profile] UiScrollable вариант {idx + 1}: {query[:80]}...")
                ui_scrollable_locator = (AppiumBy.ANDROID_UIAUTOMATOR, query)
                element = self.find_element_silent(ui_scrollable_locator, timeout=1.0)  # Уменьшили с 1.5 до 1.0
                if element:
                    print(f"[scroll_to_edit_profile] ✓ Кнопка найдена через UiScrollable вариант {idx + 1}")
                    time.sleep(0.2)  # Уменьшили с 0.3 до 0.2
                    return self
            except Exception as e:
                print(f"[scroll_to_edit_profile] ✗ UiScrollable вариант {idx + 1} не сработал: {type(e).__name__}")
                continue
        
        print("[scroll_to_edit_profile] UiScrollable не сработал, переходим к ручной прокрутке")
        
        # Если UiScrollable не сработал, используем ручную прокрутку
        size = self.driver.get_window_size()
        print(f"[scroll_to_edit_profile] Размер экрана: {size['width']}x{size['height']}")
        start_x = size['width'] / 2
        start_y = size['height'] * 0.8
        end_y = size['height'] * 0.2
        
        # Делаем несколько прокруток вниз
        print(f"[scroll_to_edit_profile] Начинаем ручную прокрутку (максимум {max_scrolls} прокруток)")
        for i in range(max_scrolls):
            print(f"[scroll_to_edit_profile] Прокрутка {i + 1}/{max_scrolls}: проверяем локаторы...")
            # Пробуем найти кнопку после каждой прокрутки
            found = False
            for locator_idx, locator in enumerate(self.EDIT_PROFILE_BUTTON[1:]):  # Пропускаем UiScrollable, уже пробовали
                try:
                    element = self.find_element_silent(locator, timeout=0.3)
                    if element:
                        print(f"[scroll_to_edit_profile] ✓ Кнопка найдена после прокрутки {i + 1} локатором #{locator_idx + 1}")
                        found = True
                        return self
                except Exception as e:
                    continue
            
            if not found:
                print(f"[scroll_to_edit_profile] Кнопка не найдена после прокрутки {i + 1}")
            
            # Если не найдена, прокручиваем дальше
            if i < max_scrolls - 1:
                self.driver.swipe(start_x, start_y, start_x, end_y, 300)
                time.sleep(0.1)
        
        print("[scroll_to_edit_profile] Обычная прокрутка не помогла, пробуем агрессивную прокрутку")
        
        # Если все еще не найдена, пробуем более агрессивную прокрутку
        start_y = size['height'] * 0.9
        end_y = size['height'] * 0.1
        for i in range(3):
            print(f"[scroll_to_edit_profile] Агрессивная прокрутка {i + 1}/3")
            self.driver.swipe(start_x, start_y, start_x, end_y, 400)
            time.sleep(0.15)
            
            for locator_idx, locator in enumerate(self.EDIT_PROFILE_BUTTON[1:]):
                try:
                    element = self.find_element_silent(locator, timeout=0.3)
                    if element:
                        print(f"[scroll_to_edit_profile] ✓ Кнопка найдена после агрессивной прокрутки {i + 1} локатором #{locator_idx + 1}")
                        return self
                except:
                    continue
        
        print("[scroll_to_edit_profile] ✗ Кнопка не найдена после всех попыток прокрутки")
        return self
    
    def click_edit_profile(self):
        """Кликает на кнопку редактирования профиля"""
        print("[click_edit_profile] Начинаем клик по кнопке 'Редактировать профиль'")
        
        # Прокручиваем до кнопки
        print("[click_edit_profile] Шаг 1: Прокручиваем до кнопки...")
        self.scroll_to_edit_profile()
        time.sleep(0.5)
        print("[click_edit_profile] Шаг 2: Прокрутка завершена, делаем скриншот...")
        self.take_screenshot('after_scroll_to_edit_profile')
        
        # Пытаемся кликнуть (пропускаем UiScrollable локатор, он только для прокрутки)
        print(f"[click_edit_profile] Шаг 3: Пытаемся кликнуть (пробуем {len(self.EDIT_PROFILE_BUTTON[1:])} локаторов)...")
        try:
            self.click_multiple(self.EDIT_PROFILE_BUTTON[1:], timeout=3)  # Уменьшили с 5 до 3
            print("[click_edit_profile] ✓ Клик выполнен успешно")
            time.sleep(1)  # Уменьшили с 2 до 1
            return self
        except Exception as e:
            print(f"[click_edit_profile] ✗ Ошибка при клике: {type(e).__name__}: {str(e)}")
            self.take_screenshot('click_edit_profile_error')
            raise
    
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
    
    def _scroll_to_calories_section(self, max_scrolls=5):
        """Прокручивает до секции калорийности, если она не видна"""
        start_time = time.time()
        print(f"[_scroll_to_calories_section] Проверяем видимость секции калорийности...")
        
        # Проверяем, видна ли секция калорий (проверяем и заголовок, и элементы с "ккал")
        try:
            # Пробуем найти заголовок "Калорийность"
            calories_title = (By.XPATH, "//*[@text='Калорийность' or contains(@text, 'Калорийность')]")
            title_element = self.find_element_silent(calories_title, timeout=1)
            if title_element and title_element.is_displayed():
                # Проверяем, виден ли рекомендованный лимит
                recommended_limit = (By.XPATH, "//*[@text='Рекомендуемый лимит' or contains(@text, 'Рекомендуемый лимит')]")
                try:
                    limit_element = self.find_element_silent(recommended_limit, timeout=0.5)
                    if limit_element and limit_element.is_displayed():
                        print(f"[_scroll_to_calories_section] ✓ Секция калорийности уже видна")
                        return
                except:
                    pass
        except:
            pass
        
        # Секция не видна, нужно прокрутить
        print(f"[_scroll_to_calories_section] Секция не видна, прокручиваем...")
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        
        # Пробуем UiScrollable для быстрой прокрутки
        try:
            from appium.webdriver.common.appiumby import AppiumBy
            ui_scrollable_queries = [
                'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("Рекомендуемый лимит"))',
                'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("Калорийность"))',
            ]
            for query in ui_scrollable_queries:
                try:
                    ui_scrollable_locator = (AppiumBy.ANDROID_UIAUTOMATOR, query)
                    element = self.find_element_silent(ui_scrollable_locator, timeout=1.0)
                    if element:
                        print(f"[_scroll_to_calories_section] ✓ Секция найдена через UiScrollable")
                        time.sleep(0.2)
                        elapsed = time.time() - start_time
                        if elapsed > 0.5:
                            print(f"[TIMING] _scroll_to_calories_section: {elapsed:.2f}с")
                        return
                except:
                    continue
        except:
            pass
        
        # Прокручиваем вниз (секция калорий находится ниже показателей и целей)
        start_y = size['height'] * 0.7
        end_y = size['height'] * 0.3
        
        print(f"[_scroll_to_calories_section] Прокручиваем вниз для поиска секции калорийности...")
        for i in range(max_scrolls):
            # Проверяем, видна ли теперь секция после каждой прокрутки
            try:
                # Проверяем рекомендованный лимит напрямую (быстрее)
                recommended_limit = (By.XPATH, "//*[@text='Рекомендуемый лимит' or contains(@text, 'Рекомендуемый лимит')]")
                limit_element = self.find_element_silent(recommended_limit, timeout=0.3)  # Уменьшили с 0.5 до 0.3
                if limit_element and limit_element.is_displayed():
                    print(f"[_scroll_to_calories_section] ✓ Секция найдена после прокрутки {i + 1}")
                    elapsed = time.time() - start_time
                    if elapsed > 0.5:
                        print(f"[TIMING] _scroll_to_calories_section: {elapsed:.2f}с")
                    return
            except:
                pass
            
            # Если не найдена, прокручиваем дальше
            if i < max_scrolls - 1:
                self.driver.swipe(start_x, start_y, start_x, end_y, 300)
                time.sleep(0.2)  # Уменьшили с 0.3 до 0.2
                print(f"[_scroll_to_calories_section] Прокрутка {i + 1} выполнена, проверяем...")
        
        elapsed = time.time() - start_time
        if elapsed > 0.5:
            print(f"[TIMING] _scroll_to_calories_section: {elapsed:.2f}с")
        print(f"[_scroll_to_calories_section] ⚠ Секция не найдена после всех прокруток, но продолжаем...")
    
    def get_calories_goal(self):
        """Получает рекомендованный лимит калорий"""
        start_time = time.time()
        print(f"[get_calories_goal] Получаем рекомендованный лимит калорий...")
        try:
            # Прокручиваем до секции калорий, если нужно
            self._scroll_to_calories_section()
            time.sleep(0.5)
            
            # Сначала проверяем, виден ли текст "Рекомендуемый лимит"
            recommended_label = (By.XPATH, "//*[@text='Рекомендуемый лимит' or contains(@text, 'Рекомендуемый лимит')]")
            if not self.is_displayed(recommended_label, timeout=1):  # Уменьшили с 2 до 1
                print(f"[get_calories_goal] ⚠ Текст 'Рекомендуемый лимит' не найден, возможно секция не видна")
                return None
            
            print(f"[get_calories_goal] Текст 'Рекомендуемый лимит' найден, ищем значение...")
            
            # Сначала получаем установленный лимит для сравнения
            set_limit_value = None
            try:
                set_limit_locator = (By.XPATH, "//*[@text='Установленный лимит']/parent::*/child::*[contains(@text, 'ккал')]")
                set_limit_text = self.get_text(set_limit_locator, timeout=0.5)  # Уменьшили с 1 до 0.5
                if set_limit_text:
                    import re
                    set_limit_numbers = re.findall(r'\d+', set_limit_text)
                    if set_limit_numbers:
                        set_limit_value = int(set_limit_numbers[0])
                        print(f"[get_calories_goal] Установленный лимит: {set_limit_value} ккал")
            except:
                print(f"[get_calories_goal] ⚠ Не удалось получить установленный лимит для сравнения")
            
            # Пробуем найти рекомендованный лимит через локаторы (ищем элемент рядом с "Рекомендуемый лимит")
            text = None
            found_locator_idx = None
            import re
            for locator_idx, locator in enumerate(self.CALORIES_RECOMMENDED_LIMIT):
                try:
                    found_text = self.get_text(locator, timeout=1)  # Уменьшили с 2 до 1
                    if found_text and 'ккал' in found_text:
                        numbers = re.findall(r'\d+', found_text)
                        if numbers:
                            found_value = int(numbers[0])
                            print(f"[get_calories_goal] Текст найден через локатор #{locator_idx + 1}: {found_text} (значение: {found_value})")
                            
                            # Проверяем, что это не установленный лимит
                            if set_limit_value is not None and found_value == set_limit_value:
                                print(f"[get_calories_goal] ⚠ Локатор #{locator_idx + 1} нашел установленный лимит ({set_limit_value}), пропускаем")
                                continue
                            
                            # Это рекомендованный лимит (отличается от установленного или установленный не найден)
                            text = found_text
                            found_locator_idx = locator_idx + 1
                            if set_limit_value is not None:
                                print(f"[get_calories_goal] ✓ Используем значение из локатора #{found_locator_idx} (отличается от установленного: {set_limit_value})")
                            else:
                                print(f"[get_calories_goal] ✓ Используем значение из локатора #{found_locator_idx} (установленный лимит не найден для сравнения)")
                            break
                except Exception as e:
                    print(f"[get_calories_goal] Локатор #{locator_idx + 1} не сработал: {type(e).__name__}")
                    continue
            
            if not text:
                # Fallback: ищем элемент рядом с текстом "Рекомендуемый лимит" более точно
                print(f"[get_calories_goal] Локаторы не сработали, пробуем точный fallback...")
                try:
                    # Ищем элемент в том же родителе, что и "Рекомендуемый лимит"
                    # Структура: <View> -> <Text>Рекомендуемый лимит</Text> -> <Text>2672 ккал</Text>
                    parent_locator = (By.XPATH, "//*[@text='Рекомендуемый лимит' or contains(@text, 'Рекомендуемый лимит')]/..")
                    parent_element = self.find_element(parent_locator, timeout=1)  # Уменьшили с 2 до 1
                    
                    # Ищем все дочерние элементы с "ккал" в этом родителе
                    children = parent_element.find_elements(By.XPATH, ".//*[contains(@text, 'ккал')]")
                    print(f"[get_calories_goal] Найдено элементов с 'ккал' в родителе: {len(children)}")
                    
                    for idx, child in enumerate(children):
                        try:
                            if child.is_displayed():
                                child_text = child.text
                                print(f"[get_calories_goal] Дочерний элемент {idx}: {child_text}")
                                if 'ккал' in child_text:
                                    text = child_text
                                    print(f"[get_calories_goal] Текст найден через fallback (дочерний элемент): {text}")
                                    break
                        except:
                            continue
                    
                    if not text:
                        # Последний fallback: ищем все элементы с "ккал" и берем второй (рекомендованный)
                        all_calories = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'ккал')]")
                        print(f"[get_calories_goal] Найдено всех элементов с 'ккал': {len(all_calories)}")
                        
                        visible_calories = []
                        for idx, elem in enumerate(all_calories):
                            try:
                                if elem.is_displayed():
                                    elem_text = elem.text
                                    visible_calories.append((idx, elem_text))
                                    print(f"[get_calories_goal] Видимый элемент {idx}: {elem_text}")
                            except:
                                continue
                        
                        # Берем второй элемент (рекомендованный лимит)
                        if len(visible_calories) >= 2:
                            text = visible_calories[1][1]  # Второй элемент
                            print(f"[get_calories_goal] Текст найден через fallback (второй элемент): {text}")
                except Exception as e:
                    print(f"[get_calories_goal] ⚠ Ошибка в fallback: {type(e).__name__}: {str(e)}")
            
            if text:
                import re
                numbers = re.findall(r'\d+', text)
                if numbers:
                    calories = int(numbers[0])
                    print(f"[get_calories_goal] ✓ Рекомендованный лимит: {calories} ккал")
                    return calories
            
            print(f"[get_calories_goal] ✗ Не удалось найти рекомендованный лимит")
            return None
        except Exception as e:
            print(f"[get_calories_goal] ✗ Ошибка: {type(e).__name__}: {str(e)}")
            return None
        finally:
            elapsed = time.time() - start_time
            if elapsed > 0.5:
                print(f"[TIMING] get_calories_goal: {elapsed:.2f}с")
    
    def get_calories_set_limit(self):
        """Получает установленный лимит калорий"""
        print(f"[get_calories_set_limit] Получаем установленный лимит калорий...")
        try:
            # Прокручиваем до секции калорий, если нужно
            self._scroll_to_calories_section()
            time.sleep(0.3)
            
            # Пробуем найти установленный лимит
            text = None
            for locator in self.CALORIES_SET_LIMIT:
                try:
                    text = self.get_text(locator, timeout=2)
                    if text:
                        print(f"[get_calories_set_limit] Текст найден: {text}")
                        break
                except:
                    continue
            
            if text:
                import re
                numbers = re.findall(r'\d+', text)
                if numbers:
                    calories = int(numbers[0])
                    print(f"[get_calories_set_limit] ✓ Установленный лимит: {calories} ккал")
                    return calories
            
            print(f"[get_calories_set_limit] ✗ Не удалось найти установленный лимит")
            return None
        except Exception as e:
            print(f"[get_calories_set_limit] ✗ Ошибка: {type(e).__name__}: {str(e)}")
            return None
    
    # Snackbar/Toast message locators
    SUCCESS_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'Профиль обновлен') or contains(@text, 'обновлен')]"),
        (By.XPATH, "//*[contains(@text, 'успешно') or contains(@text, 'успешно обновлен')]"),
        (By.XPATH, "//*[contains(@text, 'Profile updated') or contains(@text, 'updated successfully')]"),
    ]
    
    def has_success_message(self, timeout=3):
        """Проверяет наличие сообщения об успешном обновлении (snackbar/toast)"""
        try:
            return self.is_displayed_multiple(self.SUCCESS_MESSAGE, timeout=timeout)
        except:
            return False
    
    def get_success_message_text(self):
        """Получает текст сообщения об успехе"""
        try:
            for locator in self.SUCCESS_MESSAGE:
                try:
                    text = self.get_text(locator, timeout=1)
                    if text:
                        return text
                except:
                    continue
            return None
        except:
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

