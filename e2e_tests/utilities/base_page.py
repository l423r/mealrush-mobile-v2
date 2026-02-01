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

from config.appium_config import EXPLICIT_WAIT, IMPLICIT_WAIT, SCREENSHOT_DIR, get_timestamp, DETAILED_ELEMENT_LOGGING
from utilities.timing import timer


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
    
    def find_element(self, locator, timeout=EXPLICIT_WAIT, log_search=None):
        """Находит элемент с явным ожиданием
        
        Args:
            locator: Кортеж (by_type, value) или список кортежей
            timeout: Таймаут ожидания
            log_search: Логировать ли поиск (None = использовать глобальную настройку)
        """
        if log_search is None:
            log_search = DETAILED_ELEMENT_LOGGING
        
        start_time = time.perf_counter()
        locator_str = self._format_locator(locator)
        
        try:
            # Если передан список локаторов, используем find_element_multiple
            if isinstance(locator, list):
                return self.find_element_multiple(locator, timeout, log_search=log_search)
            
            # Ожидаем кортеж (by_type, value)
            by_type, value = locator
            if log_search:
                print(f"[FIND] Ищем элемент: {locator_str} (timeout={timeout}s)")
            
            # Используем locator напрямую - WebDriverWait правильно обработает и AppiumBy, и стандартный By
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            
            duration = (time.perf_counter() - start_time) * 1000
            if log_search:
                print(f"[FIND] ✓ Найден за {duration:.0f}ms: {locator_str}")
            elif duration > 2000:  # Логируем только долгие поиски (>2s) даже если логирование выключено
                print(f"[FIND] ⚠ Долгий поиск ({duration:.0f}ms): {locator_str}")
            
            return element
        except TimeoutException:
            duration = (time.perf_counter() - start_time) * 1000
            # Всегда логируем неудачные поиски (даже если логирование выключено)
            print(f"[FIND] ✗ НЕ найден за {duration:.0f}ms (timeout={timeout}s): {locator_str}")
            # Безопасно получаем значение для скриншота
            value_str = locator[1] if isinstance(locator, (tuple, list)) and len(locator) > 1 else "unknown"
            self.take_screenshot(f"element_not_found_{value_str}")
            raise
        finally:
            duration = (time.perf_counter() - start_time) * 1000
            locator_name = locator[1][:30] if isinstance(locator, tuple) and len(locator) > 1 else "unknown"
            timer.record(f"find({locator_name})", duration, category="wait")
    
    def _format_locator(self, locator):
        """Форматирует локатор для логирования"""
        if isinstance(locator, list):
            return f"[{len(locator)} локаторов]"
        if isinstance(locator, tuple) and len(locator) == 2:
            by_type, value = locator
            # Сокращаем длинные XPath
            if isinstance(value, str) and len(value) > 60:
                value = value[:57] + "..."
            return f"{by_type}: {value}"
        return str(locator)
    
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
        start_time = time.perf_counter()
        element.click()
        timer.record("click", (time.perf_counter() - start_time) * 1000, category="action")
        time.sleep(0.5)  # Небольшая пауза для стабильности
        timer.record("sleep(0.5)", 500, category="sleep")
    
    def send_keys(self, locator, text, timeout=EXPLICIT_WAIT):
        """Вводит текст в поле"""
        element = self.find_element(locator, timeout)
        start_time = time.perf_counter()
        element.clear()
        element.send_keys(text)
        timer.record("send_keys", (time.perf_counter() - start_time) * 1000, category="action")
    
    def get_text(self, locator, timeout=EXPLICIT_WAIT):
        """Получает текст элемента"""
        element = self.find_element(locator, timeout)
        return element.text
    
    def is_displayed(self, locator, timeout=EXPLICIT_WAIT, log_search=False):
        """Проверяет видимость элемента"""
        start_time = time.perf_counter()
        locator_str = self._format_locator(locator)
        
        try:
            if log_search:
                print(f"[CHECK] Проверяем видимость: {locator_str} (timeout={timeout}s)")
            element = self.find_element(locator, timeout, log_search=False)  # Не логируем внутренний поиск
            is_visible = element.is_displayed()
            duration = (time.perf_counter() - start_time) * 1000
            
            if log_search:
                status = "✓ Видим" if is_visible else "✗ Не видим"
                print(f"[CHECK] {status} за {duration:.0f}ms: {locator_str}")
            
            return is_visible
        except TimeoutException:
            duration = (time.perf_counter() - start_time) * 1000
            if log_search:
                print(f"[CHECK] ✗ Не найден за {duration:.0f}ms: {locator_str}")
            return False
        finally:
            duration = (time.perf_counter() - start_time) * 1000
            timer.record(f"is_displayed(timeout={timeout})", duration, category="check")
    
    def is_displayed_silent(self, locator, timeout=EXPLICIT_WAIT, log_search=False):
        """Проверяет видимость элемента БЕЗ скриншотов при неудаче"""
        try:
            element = self.find_element_silent(locator, timeout, log_search=log_search)
            is_visible = element.is_displayed() if element else False
            if log_search and not is_visible:
                print(f"[CHECK] [SILENT] ✗ Элемент найден, но не видим: {self._format_locator(locator)}")
            return is_visible
        except Exception:
            if log_search:
                print(f"[CHECK] [SILENT] ✗ Элемент не найден: {self._format_locator(locator)}")
            return False
    
    def find_element_silent(self, locator, timeout=EXPLICIT_WAIT, log_search=False):
        """
        Находит элемент без создания скриншотов при ошибке (для внутреннего использования)
        
        Оптимизировано: для коротких таймаутов (< 1s) использует find_elements для быстрого поиска
        без ожидания полного таймаута WebDriverWait.
        """
        try:
            by_type, value = locator
            if log_search:
                locator_str = self._format_locator(locator)
                print(f"[FIND] [SILENT] Ищем: {locator_str} (timeout={timeout}s)")
            
            # Для коротких таймаутов используем find_elements для быстрого поиска
            if timeout < 1.0:
                # Устанавливаем короткий implicit wait
                self.driver.implicitly_wait(0.1)
                try:
                    # Используем find_elements для быстрого поиска
                    elements = self.driver.find_elements(by_type, value)
                    # Проверяем видимость первого найденного элемента
                    for element in elements:
                        try:
                            if element.is_displayed():
                                if log_search:
                                    print(f"[FIND] [SILENT] ✓ Найден: {self._format_locator(locator)}")
                                return element
                        except Exception:
                            continue
                    # Если не нашли видимый элемент, пробуем первый найденный
                    if elements:
                        if log_search:
                            print(f"[FIND] [SILENT] ✓ Найден (не видимый): {self._format_locator(locator)}")
                        return elements[0]
                finally:
                    self.driver.implicitly_wait(10)
                
                # Если не нашли, выбрасываем исключение
                if log_search:
                    print(f"[FIND] [SILENT] ✗ НЕ найден: {self._format_locator(locator)}")
                raise TimeoutException(f"Element not found: {self._format_locator(locator)}")
            else:
                # Для длинных таймаутов используем стандартный WebDriverWait
                element = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_element_located(locator)
                )
                if log_search:
                    print(f"[FIND] [SILENT] ✓ Найден: {self._format_locator(locator)}")
                return element
        except TimeoutException:
            if log_search:
                print(f"[FIND] [SILENT] ✗ НЕ найден: {self._format_locator(locator)}")
            # Не создаем скриншот - это промежуточная попытка
            raise
    
    def find_element_multiple(self, locators, timeout=EXPLICIT_WAIT, log_search=None):
        """Пытается найти элемент используя несколько локаторов (fallback)"""
        if log_search is None:
            log_search = DETAILED_ELEMENT_LOGGING
        
        if isinstance(locators, tuple):
            # Один локатор - используем обычный метод
            return self.find_element(locators, timeout, log_search=log_search)
        
        # Множество локаторов - пробуем каждый без скриншотов
        if log_search:
            print(f"[FIND] [MULTIPLE] Пробуем {len(locators)} локаторов (timeout={timeout}s)")
        
        last_exception = None
        # Оптимизация: первый локатор пробуем с коротким таймаутом (0.3s), остальные с нормальным
        # Это ускоряет поиск, если первый локатор не работает
        start_time = time.perf_counter()
        
        for idx, locator in enumerate(locators):
            try:
                locator_str = self._format_locator(locator)
                if log_search:
                    print(f"[FIND] [MULTIPLE] Попытка {idx+1}/{len(locators)}: {locator_str}")
                
                # Для первого локатора используем короткий таймаут (0.3s), для остальных - нормальный (1s)
                # Это ускоряет поиск, если первый локатор не работает
                if idx == 0:
                    single_timeout = 0.3  # Быстрая проверка первого локатора
                else:
                    single_timeout = min(1, timeout / max(1, len(locators) - idx))  # Нормальный для остальных
                
                # Используем silent версию для промежуточных попыток
                element = self.find_element_silent(locator, timeout=single_timeout, log_search=log_search)
                
                duration = (time.perf_counter() - start_time) * 1000
                if log_search:
                    print(f"[FIND] [MULTIPLE] ✓ Успех на попытке {idx+1} за {duration:.0f}ms: {locator_str}")
                elif duration > 2000:  # Логируем долгие множественные поиски
                    print(f"[FIND] [MULTIPLE] ⚠ Долгий поиск ({duration:.0f}ms), успех на попытке {idx+1}: {locator_str}")
                return element
            except Exception as e:
                last_exception = e
                if log_search:
                    print(f"[FIND] [MULTIPLE] ✗ Попытка {idx+1} не удалась: {self._format_locator(locator)}")
                continue
        
        # Если ни один не сработал, создаем скриншот только для финальной ошибки
        if last_exception:
            duration = (time.perf_counter() - start_time) * 1000
            value_str = locators[0][1] if locators and len(locators[0]) > 1 else "unknown"
            # Всегда логируем полный провал множественного поиска
            print(f"[FIND] [MULTIPLE] ✗ Все {len(locators)} попыток не удались за {duration:.0f}ms")
            self.take_screenshot(f"element_not_found_{value_str}")
        raise last_exception
    
    def find_elements_multiple(self, locators, timeout=EXPLICIT_WAIT):
        """Пытается найти элементы используя несколько локаторов (fallback)
        
        Returns:
            list: Список найденных элементов или пустой список
        """
        if isinstance(locators, tuple):
            # Один локатор - используем обычный метод
            return self.find_elements(locators, timeout)
        
        # Множество локаторов - пробуем каждый
        for locator in locators:
            try:
                elements = WebDriverWait(self.driver, min(2, timeout)).until(
                    EC.presence_of_all_elements_located(locator)
                )
                if elements and len(elements) > 0:
                    return elements
            except Exception:
                continue
        
        return []
    
    def click_multiple(self, locators, timeout=EXPLICIT_WAIT):
        """Кликает на элемент используя несколько локаторов"""
        element = self.find_element_multiple(locators, timeout)
        start_time = time.perf_counter()
        element.click()
        timer.record("click", (time.perf_counter() - start_time) * 1000, category="action")
        time.sleep(0.5)
        timer.record("sleep(0.5)", 500, category="sleep")
    
    def send_keys_multiple(self, locators, text, timeout=EXPLICIT_WAIT):
        """Вводит текст используя несколько локаторов"""
        element = self.find_element_multiple(locators, timeout)
        start_time = time.perf_counter()
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
        timer.record("send_keys_multiple", (time.perf_counter() - start_time) * 1000, category="action")
    
    def clear_and_type(self, locator, text, timeout=EXPLICIT_WAIT):
        """Очищает поле и вводит текст (для единичных локаторов)"""
        element = self.find_element(locator, timeout)
        start_time = time.perf_counter()
        
        # Прокручиваем к элементу, если он не виден
        try:
            # Пробуем прокрутить к элементу через UiScrollable (для Android)
            from appium.webdriver.common.appiumby import AppiumBy
            if not element.is_displayed():
                # Если элемент не виден, пытаемся прокрутить
                try:
                    self.driver.execute_script('mobile: scroll', {
                        'element': element,
                        'direction': 'down'
                    })
                    time.sleep(0.3)
                    timer.record("sleep(0.3)", 300, category="sleep")
                except:
                    pass
        except:
            pass
        
        # Очищаем поле и вводим текст
        try:
            # Для Appium используем set_value - это быстрее и надежнее
            element.set_value(text)
            time.sleep(0.2)
            timer.record("sleep(0.2)", 200, category="sleep")
        except:
            # Fallback на обычный способ
            try:
                element.clear()
                time.sleep(0.1)
                timer.record("sleep(0.1)", 100, category="sleep")
            except:
                pass
            element.send_keys(text)
            time.sleep(0.2)
            timer.record("sleep(0.2)", 200, category="sleep")
        
        timer.record("clear_and_type", (time.perf_counter() - start_time) * 1000, category="action")
        return self
    
    def is_displayed_multiple(self, locators, timeout=EXPLICIT_WAIT, silent=True):
        """Проверяет видимость элемента используя несколько локаторов
        
        Args:
            locators: Локатор или список локаторов
            timeout: Общий таймаут
            silent: Если True - не делает скриншоты при неудаче
        """
        if isinstance(locators, tuple):
            return self.is_displayed_silent(locators, timeout) if silent else self.is_displayed(locators, timeout)
        
        # Используем меньший timeout для каждого локатора
        single_timeout = min(1, timeout / len(locators)) if locators else 1
        check_method = self.is_displayed_silent if silent else self.is_displayed
        
        for locator in locators:
            try:
                if check_method(locator, timeout=single_timeout):
                    return True
            except Exception:
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
    
    def timed_sleep(self, seconds, label=None):
        """
        Sleep с профилированием времени.
        
        Использует вместо time.sleep() для отслеживания времени ожиданий.
        
        Args:
            seconds: Время ожидания в секундах
            label: Опциональная метка для идентификации (например, имя операции)
        """
        time.sleep(seconds)
        name = f"sleep({seconds}s)" if label is None else f"sleep({label}:{seconds}s)"
        timer.record(name, seconds * 1000, category="sleep")

