"""
Page Object для экрана поиска продуктов (SearchScreen)
Story 3.1: Create Meal Entry

UI Structure (SearchScreen.tsx):
- Header с поиском
- Tabs: Все / Избранное / Мои / Шаблоны
- Quick Actions (Photo, Audio, Text analysis, Scanner)
- Список продуктов (FlashList)

User Flow:
MainScreen → FAB → SearchScreen → Поиск/выбор продукта → MealElementScreen
"""
import os
import sys
import time
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class SearchPage(BasePage):
    """Класс для работы с экраном поиска (SearchScreen)"""
    
    # ==========================================================================
    # LOCATORS - основанные на реальном SearchScreen.tsx
    # ==========================================================================
    
    # Header и поиск
    # Порядок оптимизирован: рабочие локаторы первыми (по логам)
    SEARCH_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Поиск') or contains(@text, 'Поиск')]"),  # Рабочий локатор (найден в логах)
        (AppiumBy.ACCESSIBILITY_ID, "search_input"),  # Не работает, но оставляем как fallback
        (By.XPATH, "//android.widget.EditText"),  # Fallback - самый общий
    ]
    
    BACK_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "Назад"),
        (By.XPATH, "//*[@content-desc='Назад']"),
        (By.XPATH, "//android.widget.ImageButton"),
    ]
    
    # ==========================================================================
    # Tabs: Все / Избранное / Мои / Шаблоны
    # ==========================================================================
    
    TAB_ALL = [
        (By.XPATH, "//*[@text='Все']"),
        (By.XPATH, "//android.widget.TextView[@text='Все']"),
    ]
    
    TAB_FAVORITES = [
        (By.XPATH, "//*[@text='Избранное']"),
        (By.XPATH, "//android.widget.TextView[@text='Избранное']"),
    ]
    
    TAB_MY_PRODUCTS = [
        (By.XPATH, "//*[@text='Мои']"),
        (By.XPATH, "//android.widget.TextView[@text='Мои']"),
    ]
    
    TAB_TEMPLATES = [
        (By.XPATH, "//*[@text='Шаблоны']"),
        (By.XPATH, "//android.widget.TextView[@text='Шаблоны']"),
    ]
    
    # ==========================================================================
    # Quick Actions (AI Analysis, Scanner)
    # ==========================================================================
    
    # Photo Analysis Quick Action
    QUICK_ACTION_PHOTO = [
        (AppiumBy.ACCESSIBILITY_ID, "quick_action_photo"),
        (By.XPATH, "//*[contains(@content-desc, 'Фото') or contains(@text, 'Фото')]"),
        (By.XPATH, "//*[contains(@content-desc, 'camera') or contains(@content-desc, 'photo')]"),
    ]
    
    # Audio Analysis Quick Action
    QUICK_ACTION_AUDIO = [
        (AppiumBy.ACCESSIBILITY_ID, "quick_action_audio"),
        (By.XPATH, "//*[contains(@content-desc, 'Голос') or contains(@text, 'Голос')]"),
        (By.XPATH, "//*[contains(@content-desc, 'mic') or contains(@content-desc, 'audio')]"),
    ]
    
    # Text Analysis Quick Action
    QUICK_ACTION_TEXT = [
        (AppiumBy.ACCESSIBILITY_ID, "quick_action_text"),
        (By.XPATH, "//*[contains(@content-desc, 'Текст') or contains(@text, 'Текст')]"),
        (By.XPATH, "//*[contains(@content-desc, 'document') or contains(@content-desc, 'text')]"),
    ]
    
    # Scanner Quick Action (Barcode)
    QUICK_ACTION_SCANNER = [
        (AppiumBy.ACCESSIBILITY_ID, "quick_action_scanner"),
        (By.XPATH, "//*[contains(@content-desc, 'Сканер') or contains(@text, 'Сканер')]"),
        (By.XPATH, "//*[contains(@content-desc, 'barcode') or contains(@content-desc, 'scan')]"),
    ]
    
    # ==========================================================================
    # Product List
    # ==========================================================================
    
    # Карточка продукта в списке - несколько вариантов локаторов
    # На UI: название + БЖУ ("Б: X.Xг • Ж: Xг • У: Xг") + калории ("XXX ккал на 100.0 г")
    PRODUCT_ITEM = [
        # Ищем по тексту "ккал на" (специфичнее чем просто "ккал")
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, 'ккал на')]]"),
        # Ищем по паттерну БЖУ (Б: + Ж: + У:)
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, 'Б:')]]"),
        # Ищем кликабельный ViewGroup с калориями
        (By.XPATH, "//android.view.ViewGroup[@clickable='true'][.//android.widget.TextView[contains(@text, 'ккал')]]"),
        # Fallback - любой ViewGroup с текстом калорий и его ancestor
        (By.XPATH, "//*[contains(@text, 'ккал на')]/ancestor::android.view.ViewGroup[@clickable='true']"),
        (By.XPATH, "//*[contains(@text, 'ккал')]/ancestor::android.view.ViewGroup[2]"),
    ]
    
    # Текст с калориями для проверки наличия продуктов
    PRODUCT_CALORIES_TEXT = [
        (By.XPATH, "//*[contains(@text, 'ккал на')]"),
        (By.XPATH, "//*[contains(@text, 'ккал')]"),
    ]
    
    # Название продукта (первый TextView без калорий и БЖУ)
    PRODUCT_NAME = (By.XPATH, "//android.widget.TextView[not(contains(@text, 'ккал')) and not(contains(@text, 'Б:')) and not(contains(@text, '/'))]")
    
    # Калории продукта
    PRODUCT_CALORIES = (By.XPATH, "//*[contains(@text, 'ккал')]")
    
    # Кнопка избранного (звездочка)
    FAVORITE_BUTTON = [
        (By.XPATH, "//*[contains(@content-desc, 'star') or contains(@content-desc, 'favorite')]"),
        (By.XPATH, "//*[contains(@content-desc, 'heart') or contains(@content-desc, 'favorite')]"),
        (By.XPATH, "//*[@content-desc='Избранное']"),
    ]
    
    # ==========================================================================
    # Loading & Empty States
    # ==========================================================================
    
    LOADING_INDICATOR = [
        (By.XPATH, "//*[contains(@text, 'Загрузка')]"),
        (By.XPATH, "//android.widget.ProgressBar"),
    ]
    
    EMPTY_STATE = [
        (By.XPATH, "//*[contains(@text, 'Ничего не найдено')]"),
        (By.XPATH, "//*[contains(@text, 'Продукты не найдены')]"),
        (By.XPATH, "//*[contains(@text, 'Нет результатов')]"),
    ]
    
    # ==========================================================================
    # Dialogs (Photo Analysis, Text Analysis, Audio Analysis)
    # ==========================================================================
    
    PHOTO_ANALYSIS_DIALOG = (By.XPATH, "//*[contains(@text, 'Анализ фото')]")
    TEXT_ANALYSIS_DIALOG = (By.XPATH, "//*[contains(@text, 'Текстовый анализ')]")
    AUDIO_ANALYSIS_DIALOG = (By.XPATH, "//*[contains(@text, 'Голосовой анализ')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.SEARCH_INPUT
    
    # ==========================================================================
    # PAGE STATE METHODS
    # ==========================================================================
    
    def is_page_loaded(self, timeout=5):
        """
        Проверяет, загрузилась ли страница поиска (оптимизированная версия)
        
        Проверяем наличие EditText или табов - без скриншотов при неудаче
        """
        self.driver.implicitly_wait(0.5)  # Быстрый поиск
        try:
            # Быстрая проверка - ищем любой EditText (поле поиска)
            try:
                elements = self.driver.find_elements(By.XPATH, "//android.widget.EditText")
                if elements:
                    return True
            except Exception:
                pass
            
            # Альтернативная проверка - табы "Все" или "Избранное"
            try:
                tabs = self.driver.find_elements(By.XPATH, "//*[@text='Все' or @text='Избранное']")
                if tabs:
                    return True
            except Exception:
                pass
            
            return False
        finally:
            self.driver.implicitly_wait(10)  # Восстанавливаем
    
    def is_searching(self):
        """Проверяет, идет ли поиск (показан индикатор загрузки) - без скриншотов"""
        return self.is_displayed_multiple(self.LOADING_INDICATOR, timeout=1, silent=True)
    
    def _dismiss_keyboard_safely(self):
        """
        Безопасно скрывает клавиатуру (оптимизированный)
        """
        try:
            # Кликаем в верхнюю часть экрана чтобы убрать фокус
            self.driver.tap([(200, 150)], 50)
        except Exception:
            pass
    
    def has_no_results(self):
        """Проверяет, нет ли результатов поиска"""
        return self.is_displayed_multiple(self.EMPTY_STATE, timeout=2)
    
    # ==========================================================================
    # SEARCH METHODS
    # ==========================================================================
    
    def enter_search_query(self, query):
        """
        Вводит поисковый запрос
        
        Args:
            query: Текст для поиска
        """
        self.send_keys_multiple(self.SEARCH_INPUT, query)
        # Убрали sleep - wait_for_search_results будет ждать появления результатов
        return self
    
    def clear_search(self):
        """Очищает поисковый запрос"""
        try:
            search_input = self.find_element_multiple(self.SEARCH_INPUT)
            if search_input:
                search_input.clear()
                time.sleep(1)
        except:
            pass
        return self
    
    def search_product(self, query, take_screenshot=True):
        """
        Полный процесс поиска продукта (оптимизированный)
        
        Args:
            query: Текст для поиска (минимум 2 символа для срабатывания)
            take_screenshot: Делать ли скриншот результатов
        """
        self.enter_search_query(query)
        # Оптимизированный таймаут - результаты обычно появляются быстро (< 5 сек)
        # Но даем больше времени на случай медленного API
        self.wait_for_search_results(timeout=5)
        self._dismiss_keyboard_safely()
        if take_screenshot:
            self.take_screenshot(f'search_results_{query.replace(" ", "_")}')
        return self
    
    def wait_for_search_results(self, timeout=5):
        """
        Ожидает появления результатов поиска (оптимизированный)
        
        Ждет пока появятся продукты ИЛИ сообщение "ничего не найдено"
        Возвращается сразу, как только найдет результаты.
        """
        start_time = time.time()
        poll_interval = 0.1  # Уменьшили до 0.1 для более быстрой проверки
        
        # Устанавливаем короткий implicit wait один раз
        self.driver.implicitly_wait(0.1)
        
        try:
            while time.time() - start_time < timeout:
                # Быстрая проверка - есть ли элементы с "ккал на" (самый быстрый способ)
                try:
                    elements = self.driver.find_elements(By.XPATH, "//android.widget.TextView[contains(@text, 'ккал на')]")
                    if elements and len(elements) > 0:
                        # Проверяем что хотя бы один элемент видим (быстрая проверка первого)
                        try:
                            if elements[0].is_displayed():
                                return True
                        except Exception:
                            # Если is_displayed() не работает, считаем что элементы есть
                            return True
                except Exception:
                    pass
                
                # Проверяем сообщение "ничего не найдено" (быстрая проверка)
                try:
                    no_results = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'ничего не найдено') or contains(@text, 'Не найдено')]")
                    if no_results and len(no_results) > 0:
                        try:
                            if no_results[0].is_displayed():
                                return True
                        except Exception:
                            return True
                except Exception:
                    pass
                
                # Проверяем индикатор загрузки - если его нет и прошло больше 0.3s, проверяем результаты еще раз
                elapsed = time.time() - start_time
                if elapsed > 0.3:
                    # Если нет индикатора загрузки, значит поиск завершен
                    try:
                        loading = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'Загрузка') or contains(@content-desc, 'Загрузка')]")
                        if not loading or len(loading) == 0:
                            # Поиск завершен, проверяем результаты еще раз
                            elements = self.driver.find_elements(By.XPATH, "//android.widget.TextView[contains(@text, 'ккал на')]")
                            if elements and len(elements) > 0:
                                return True
                            # Проверяем "ничего не найдено"
                            no_results = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'ничего не найдено') or contains(@text, 'Не найдено')]")
                            if no_results and len(no_results) > 0:
                                return True
                    except Exception:
                        pass
                
                time.sleep(poll_interval)
        finally:
            # Восстанавливаем implicit wait
            self.driver.implicitly_wait(10)
        
        return False
    
    # ==========================================================================
    # PRODUCT LIST METHODS
    # ==========================================================================
    
    def get_products_count(self):
        """
        Получает количество найденных продуктов (уникальных карточек)
        
        Returns:
            int: Количество продуктов
        """
        self.driver.implicitly_wait(0.5)  # Оптимизировано: уменьшено с 1 до 0.5
        try:
            # Считаем по уникальным текстам "XXX ккал на 100.0 г"
            # Эти тексты уникальны для каждой карточки продукта
            elements = self.driver.find_elements(By.XPATH, "//android.widget.TextView[contains(@text, 'ккал на')]")
            
            # Фильтруем: только элементы в области списка (y > 400)
            unique_products = []
            seen_y_positions = []
            
            for el in elements[:20]:  # Ограничиваем проверку первыми 20 элементами для скорости
                try:
                    if not el.is_displayed():
                        continue
                    y = el.location['y']
                    # Проверяем что элемент в области списка и не дубликат (разница y > 50)
                    if y > 400:
                        is_duplicate = False
                        for seen_y in seen_y_positions:
                            if abs(y - seen_y) < 50:  # Элементы слишком близко - скорее всего дубликат
                                is_duplicate = True
                                break
                        if not is_duplicate:
                            unique_products.append(el)
                            seen_y_positions.append(y)
                except Exception:
                    pass
            
            return len(unique_products)
        except Exception:
            pass
        finally:
            self.driver.implicitly_wait(10)
        
        # Fallback: старый способ
        try:
            calories_texts = self.find_elements_multiple(self.PRODUCT_CALORIES_TEXT)
            if calories_texts and len(calories_texts) > 0:
                return len(calories_texts)
        except:
            pass
        
        # Способ 3: Ищем любой текст "ккал"
        try:
            elements = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'ккал')]")
            # Фильтруем только реальные продукты (не Quick Actions заголовки)
            product_count = 0
            for el in elements:
                text = el.text if el.text else ""
                if "ккал на" in text or "ккал/" in text:
                    product_count += 1
            if product_count > 0:
                return product_count
        except:
            pass
        
        return 0
    
    def click_product(self, index=0):
        """
        Кликает на продукт по индексу (оптимизированный)
        Открывает MealElementScreen
        
        Args:
            index: Индекс продукта (0-based)
        """
        # Находим элемент с "ккал на" для точного определения карточки продукта
        self.driver.implicitly_wait(1)
        try:
            calories_elements = self.driver.find_elements(By.XPATH, "//android.widget.TextView[contains(@text, 'ккал на')]")
        finally:
            self.driver.implicitly_wait(10)
        
        if not calories_elements:
            print(f"❌ No products found")
            return self
        
        # Фильтруем по Y-позиции и берем нужный индекс
        valid_elements = [(el, el.location['y']) for el in calories_elements if el.location['y'] > 400]
        valid_elements.sort(key=lambda x: x[1])  # Сортируем по Y
        
        if index >= len(valid_elements):
            print(f"❌ No product at index {index}, found {len(valid_elements)}")
            return self
        
        target_element = valid_elements[index][0]
        location = target_element.location
        
        # Кликаем выше текста калорий (на название продукта)
        card_center_x = location['x'] + 100
        card_center_y = location['y'] - 70
        
        print(f"Clicking product at ({card_center_x}, {card_center_y})")
        
        # Используем doubleClickGesture - самый надежный способ
        try:
            self.driver.execute_script('mobile: doubleClickGesture', {
                'x': card_center_x,
                'y': card_center_y
            })
            time.sleep(0.5)  # Минимальная задержка для перехода
            return self
        except Exception as e:
            print(f"doubleClickGesture failed: {e}")
        
        # Fallback: простой клик
        try:
            target_element.click()
            time.sleep(0.5)
        except Exception as e:
            print(f"element.click failed: {e}")
        
        return self
    
    def click_first_product(self):
        """Кликает на первый продукт в списке"""
        return self.click_product(0)
    
    def debug_print_products(self):
        """
        Отладочный метод - печатает все найденные элементы с калориями и их координаты
        """
        print("\n=== DEBUG: Searching for products ===")
        try:
            # Ищем все элементы с "ккал"
            elements = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'ккал')]")
            print(f"Found {len(elements)} elements with 'ккал' text:")
            for i, el in enumerate(elements):
                try:
                    text = el.text
                    class_name = el.get_attribute("className")
                    clickable = el.get_attribute("clickable")
                    location = el.location
                    size = el.size
                    print(f"  [{i}] class={class_name}, clickable={clickable}")
                    print(f"       text='{text}'")
                    print(f"       location=({location['x']}, {location['y']}), size=({size['width']}x{size['height']})")
                except:
                    print(f"  [{i}] Could not get element info")
        except Exception as e:
            print(f"Error finding elements: {e}")
        
        # Ищем названия продуктов
        try:
            names = self.driver.find_elements(
                By.XPATH, 
                "//android.widget.TextView[string-length(@text) > 10 and not(contains(@text, 'ккал')) and not(contains(@text, 'Б:')) and not(contains(@text, 'Поиск'))]"
            )
            print(f"\nFound {len(names)} potential product names:")
            for i, el in enumerate(names[:5]):  # Показываем первые 5
                try:
                    location = el.location
                    print(f"  [{i}] '{el.text[:40]}...' at ({location['x']}, {location['y']})")
                except:
                    pass
        except:
            pass
        
        # Размер экрана
        try:
            window_size = self.driver.get_window_size()
            print(f"\nWindow size: {window_size['width']}x{window_size['height']}")
        except:
            pass
        
        print("=== END DEBUG ===\n")
    
    def get_product_name(self, index=0):
        """
        Получает название продукта по индексу
        
        Args:
            index: Индекс продукта
        Returns:
            str: Название продукта или None
        """
        try:
            products = self.find_elements_multiple(self.PRODUCT_ITEM)
            if products and index < len(products):
                name_elements = products[index].find_elements(*self.PRODUCT_NAME)
                if name_elements:
                    return name_elements[0].text
        except:
            pass
        return None
    
    # ==========================================================================
    # TAB METHODS
    # ==========================================================================
    
    def click_tab_all(self):
        """Переключает на вкладку 'Все'"""
        self.click_multiple(self.TAB_ALL)
        time.sleep(1)
        return self
    
    def click_tab_favorites(self):
        """Переключает на вкладку 'Избранное'"""
        self.click_multiple(self.TAB_FAVORITES)
        time.sleep(1)
        return self
    
    def click_tab_my_products(self):
        """Переключает на вкладку 'Мои'"""
        self.click_multiple(self.TAB_MY_PRODUCTS)
        time.sleep(1)
        return self
    
    def click_tab_templates(self):
        """Переключает на вкладку 'Шаблоны'"""
        self.click_multiple(self.TAB_TEMPLATES)
        time.sleep(1)
        return self
    
    # ==========================================================================
    # QUICK ACTION METHODS (AI Integration - AC: 5)
    # ==========================================================================
    
    def click_photo_analysis(self):
        """
        Кликает на Quick Action фото-анализа
        AC: 5 - AI Integration
        """
        self.click_multiple(self.QUICK_ACTION_PHOTO)
        time.sleep(2)
        return self
    
    def click_audio_analysis(self):
        """
        Кликает на Quick Action голосового анализа
        AC: 5 - AI Integration
        """
        self.click_multiple(self.QUICK_ACTION_AUDIO)
        time.sleep(2)
        return self
    
    def click_text_analysis(self):
        """
        Кликает на Quick Action текстового анализа
        AC: 5 - AI Integration
        """
        self.click_multiple(self.QUICK_ACTION_TEXT)
        time.sleep(2)
        return self
    
    def click_scanner(self):
        """Кликает на Quick Action сканера штрих-кодов"""
        self.click_multiple(self.QUICK_ACTION_SCANNER)
        time.sleep(2)
        return self
    
    def is_photo_analysis_visible(self):
        """Проверяет, виден ли Quick Action фото-анализа"""
        return self.is_displayed_multiple(self.QUICK_ACTION_PHOTO, timeout=3)
    
    def is_audio_analysis_visible(self):
        """Проверяет, виден ли Quick Action голосового анализа"""
        return self.is_displayed_multiple(self.QUICK_ACTION_AUDIO, timeout=3)
    
    def is_text_analysis_visible(self):
        """Проверяет, виден ли Quick Action текстового анализа"""
        return self.is_displayed_multiple(self.QUICK_ACTION_TEXT, timeout=3)
    
    # ==========================================================================
    # FAVORITE METHODS
    # ==========================================================================
    
    def toggle_favorite(self, product_index=0):
        """
        Переключает избранное для продукта по индексу
        
        Args:
            product_index: Индекс продукта
        """
        try:
            products = self.find_elements_multiple(self.PRODUCT_ITEM)
            if products and product_index < len(products):
                favorite_buttons = products[product_index].find_elements(*self.FAVORITE_BUTTON[0])
                if favorite_buttons:
                    favorite_buttons[0].click()
                    time.sleep(1)
        except:
            pass
        return self
    
    # ==========================================================================
    # NAVIGATION METHODS
    # ==========================================================================
    
    def go_back(self):
        """Возвращается на предыдущий экран (MainScreen)"""
        try:
            self.click_multiple(self.BACK_BUTTON)
        except:
            self.driver.back()
        time.sleep(2)
        return self
    
    # ==========================================================================
    # DEPRECATED METHODS (для обратной совместимости)
    # ==========================================================================
    
    def click_add_to_meal(self):
        """
        DEPRECATED: Добавление происходит на MealElementScreen, не на SearchScreen
        """
        print("Warning: click_add_to_meal is deprecated. Use MealElementPage instead.")
        return self
    
    def click_create_product(self):
        """Кликает на кнопку создания нового продукта (если есть)"""
        try:
            create_button = (By.XPATH, "//*[contains(@text, 'Создать продукт') or contains(@text, 'Добавить продукт')]")
            self.click(create_button)
            time.sleep(2)
        except:
            pass
        return self
