"""
Page Object для экрана добавления/редактирования элемента приема пищи (MealElementScreen)
Story 3.1: Create Meal Entry

UI Structure (MealElementScreen.tsx):
- Header с заголовком (Добавление/Редактирование)
- Product Info: изображение и название продукта
- Nutrients Section:
  - Top Row: Количество (г) и Калории (ккал)
  - Bottom Row: Белки (г), Жиры (г), Углеводы (г)
  - Meal Type Selector (вертикально справа): BREAKFAST, LUNCH, DINNER, SUPPER, LATE_SUPPER
- Summary: "Итого: 100 г • 52 ккал • Завтрак"
- Footer: Кнопка "Добавить блюдо" / "Сохранить изменения"

User Flow:
SearchScreen → Клик на продукт → MealElementScreen → Ввод количества → Выбор типа meal → Добавить
"""
import os
import sys
import time
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MealElementPage(BasePage):
    """Класс для работы с экраном добавления элемента в прием пищи (MealElementScreen)"""
    
    # ==========================================================================
    # LOCATORS - основанные на реальном MealElementScreen.tsx
    # ==========================================================================
    
    # Header
    HEADER_BACK_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "Назад"),
        (By.XPATH, "//*[@content-desc='Назад']"),
        (By.XPATH, "//android.widget.ImageButton"),
    ]
    
    HEADER_TITLE = [
        (By.XPATH, "//*[starts-with(@text, 'Добавление')]"),  # "Добавление - 31 января"
        (By.XPATH, "//*[@text='Редактирование']"),
        (By.XPATH, "//*[@text='Просмотр']"),
        (By.XPATH, "//*[starts-with(@text, 'Создание')]"),  # "Создание - 31 января"
    ]
    
    # ==========================================================================
    # Product Info
    # ==========================================================================
    
    PRODUCT_IMAGE = (By.XPATH, "//android.widget.Image | //android.widget.ImageView")
    PRODUCT_NAME = (By.XPATH, "//android.widget.TextView[not(contains(@text, 'ккал')) and not(contains(@text, 'г')) and not(contains(@text, 'Итого'))]")
    
    # ==========================================================================
    # Nutrient Inputs (используем Input компонент с testID)
    # ==========================================================================
    
    # Количество (граммы)
    # Порядок оптимизирован: более специфичные локаторы первыми для быстрого поиска
    QUANTITY_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "quantity_input"),  # Самый специфичный - testID
        (By.XPATH, "//android.widget.EditText[@hint='Количество (г)' or @hint='100']"),  # Точный hint
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Количество')]"),  # Частичное совпадение hint
        (By.XPATH, "//android.widget.TextView[@text='Количество (г)']/following-sibling::*//android.widget.EditText"),  # По label
        (By.XPATH, "//android.widget.EditText[preceding-sibling::*[contains(@text, 'Количество')]]"),  # По предшествующему тексту
        (By.XPATH, "(//android.widget.EditText)[1]"),  # Самый общий - последний (с коротким таймаутом)
    ]
    
    # Калории
    # Порядок оптимизирован: рабочие локаторы первыми (по логам, локатор с following-sibling работает лучше всего)
    CALORIES_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "calories_input"),  # Самый специфичный - testID
        (By.XPATH, "//android.widget.TextView[@text='Калории (ккал)']/following-sibling::*//android.widget.EditText"),  # По label (рабочий локатор по логам)
        (By.XPATH, "//android.widget.EditText[@hint='Калории' or @hint='ккал']"),  # Точный hint
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Калории') or contains(@hint, 'ккал')]"),  # Частичное совпадение hint
        (By.XPATH, "//android.widget.EditText[preceding-sibling::*[contains(@text, 'Калории')]]"),  # По предшествующему тексту
        (By.XPATH, "(//android.widget.EditText)[2]"),  # Самый общий - последний (с коротким таймаутом)
    ]
    
    # Белки
    PROTEINS_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "proteins_input"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Белки') or preceding-sibling::*[contains(@text, 'Белки')]]"),
        (By.XPATH, "(//android.widget.EditText)[3]"),  # Третий инпут
    ]
    
    # Жиры
    FATS_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "fats_input"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Жиры') or preceding-sibling::*[contains(@text, 'Жиры')]]"),
        (By.XPATH, "(//android.widget.EditText)[4]"),  # Четвертый инпут
    ]
    
    # Углеводы
    CARBS_INPUT = [
        (AppiumBy.ACCESSIBILITY_ID, "carbohydrates_input"),
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'Углеводы') or preceding-sibling::*[contains(@text, 'Углеводы')]]"),
        (By.XPATH, "(//android.widget.EditText)[5]"),  # Пятый инпут
    ]
    
    # ==========================================================================
    # Meal Type Selector (вертикальные кнопки справа)
    # ==========================================================================
    
    MEAL_TYPE_BREAKFAST = [
        (By.XPATH, "//*[@text='Завтрак']"),
        (By.XPATH, "//android.widget.TextView[@text='Завтрак']/parent::*"),
    ]
    
    MEAL_TYPE_LUNCH = [
        (By.XPATH, "//*[@text='Обед']"),
        (By.XPATH, "//android.widget.TextView[@text='Обед']/parent::*"),
    ]
    
    MEAL_TYPE_DINNER = [
        (By.XPATH, "//*[@text='Ужин']"),
        (By.XPATH, "//android.widget.TextView[@text='Ужин']/parent::*"),
    ]
    
    MEAL_TYPE_SUPPER = [
        (By.XPATH, "//*[@text='Полдник']"),
        (By.XPATH, "//android.widget.TextView[@text='Полдник']/parent::*"),
    ]
    
    MEAL_TYPE_LATE_SUPPER = [
        (By.XPATH, "//*[@text='Поздний ужин']"),
        (By.XPATH, "//android.widget.TextView[@text='Поздний ужин']/parent::*"),
    ]
    
    # SNACK тип пока не добавлен в UI выбора (только на backend)
    MEAL_TYPE_SNACK = [
        (By.XPATH, "//*[@text='Перекус']"),
        (By.XPATH, "//android.widget.TextView[@text='Перекус']/parent::*"),
    ]
    
    # Словарь для быстрого доступа к meal types
    MEAL_TYPES = {
        'BREAKFAST': MEAL_TYPE_BREAKFAST,
        'LUNCH': MEAL_TYPE_LUNCH,
        'DINNER': MEAL_TYPE_DINNER,
        'SUPPER': MEAL_TYPE_SUPPER,
        'LATE_SUPPER': MEAL_TYPE_LATE_SUPPER,
        'SNACK': MEAL_TYPE_SNACK,
    }
    
    # ==========================================================================
    # Summary Section
    # ==========================================================================
    
    SUMMARY_TEXT = (By.XPATH, "//*[contains(@text, 'Итого')]")
    
    # ==========================================================================
    # Action Buttons
    # ==========================================================================
    
    # Кнопка "Добавить блюдо" / "Сохранить изменения"
    ADD_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "add_meal_element_button"),
        (By.XPATH, "//*[@text='Добавить блюдо']"),
        (By.XPATH, "//*[@text='Сохранить изменения']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]"),
    ]
    
    # Кнопка "Сохранить как продукт" (только при редактировании)
    SAVE_AS_PRODUCT_BUTTON = [
        (By.XPATH, "//*[@text='Сохранить как продукт']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Сохранить как')]"),
    ]
    
    # ==========================================================================
    # Confirmation Dialog (MealTypeConfirmDialog)
    # ==========================================================================
    
    CONFIRM_DIALOG = [
        (By.XPATH, "//*[contains(@text, 'уже есть')]"),
        (By.XPATH, "//*[contains(@text, 'Добавить к существующему приему')]"),
        (By.XPATH, "//*[contains(@text, 'существующему приему')]"),
    ]
    CONFIRM_ADD_TO_EXISTING = [
        (By.XPATH, "//*[@text='Добавить к существующему']"),
        (By.XPATH, "//*[contains(@text, 'существующему')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить к')]"),
    ]
    CONFIRM_CREATE_NEW = [
        (By.XPATH, "//*[@text='Создать новый прием']"),
        (By.XPATH, "//*[@text='Создать новый']"),
        (By.XPATH, "//*[contains(@text, 'новый')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Создать')]"),
    ]
    CONFIRM_CANCEL = [
        (By.XPATH, "//*[@text='Отмена']"),
        (By.XPATH, "//*[@text='Cancel']"),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.ADD_BUTTON
    
    # ==========================================================================
    # PAGE STATE METHODS
    # ==========================================================================
    
    def is_page_loaded(self, timeout=10):
        """
        Проверяет, загрузилась ли страница добавления элемента
        
        Проверяем наличие:
        1. Заголовка (Добавление/Редактирование)
        2. Кнопки добавления
        3. Инпута количества
        
        Args:
            timeout: Максимальное время ожидания каждого элемента (делится на 3 проверки)
        """
        # Распределяем timeout между проверками (минимум 2 секунды на каждую)
        check_timeout = max(2, timeout // 3)
        
        # Проверяем заголовок
        for locator in self.HEADER_TITLE:
            try:
                if self.is_displayed(locator, timeout=check_timeout):
                    return True
            except:
                continue
        
        # Проверяем кнопку добавления
        try:
            if self.is_displayed_multiple(self.ADD_BUTTON, timeout=check_timeout):
                return True
        except:
            pass
        
        # Проверяем инпут количества
        try:
            if self.is_displayed_multiple(self.QUANTITY_INPUT, timeout=check_timeout):
                return True
        except:
            pass
        
        return False
    
    def is_editing_mode(self):
        """Проверяет, находимся ли мы в режиме редактирования"""
        try:
            return self.is_displayed((By.XPATH, "//*[@text='Редактирование']"), timeout=2)
        except:
            return False
    
    def is_adding_mode(self):
        """Проверяет, находимся ли мы в режиме добавления"""
        try:
            return self.is_displayed((By.XPATH, "//*[starts-with(@text, 'Добавление')]"), timeout=2)
        except:
            return False
    
    def get_displayed_date(self):
        """
        Получает дату, которая отображается на экране (если есть)
        
        Returns:
            str: Текст даты или None если не найдена
        """
        # Ищем дату в различных форматах (может быть в header или рядом с summary)
        date_patterns = [
            (By.XPATH, "//*[contains(@text, '/') and string-length(@text) <= 10]"),  # DD/MM или DD/MM/YYYY
            (By.XPATH, "//*[contains(@text, '.') and string-length(@text) <= 10]"),  # DD.MM или DD.MM.YYYY
            (By.XPATH, "//android.widget.TextView[contains(@text, '202')]"),  # Год 2024/2025
        ]
        
        for pattern in date_patterns:
            try:
                elements = self.driver.find_elements(*pattern)
                for el in elements:
                    text = el.text.strip()
                    # Проверяем что это похоже на дату
                    if '/' in text or '.' in text or '202' in text:
                        return text
            except Exception:
                continue
        
        return None
    
    # ==========================================================================
    # PRODUCT INFO METHODS
    # ==========================================================================
    
    def get_product_name(self):
        """Получает название продукта"""
        try:
            # Ищем первый текст, который не содержит числовых значений
            elements = self.find_elements(self.PRODUCT_NAME, timeout=5)
            for elem in elements:
                text = elem.text
                if text and not any(c.isdigit() for c in text):
                    return text
        except:
            pass
        return None
    
    # ==========================================================================
    # NUTRIENT INPUT METHODS
    # ==========================================================================
    
    def enter_quantity(self, quantity):
        """
        Вводит количество в граммах
        
        Args:
            quantity: Количество (число или строка)
        """
        self.clear_and_type_multiple(self.QUANTITY_INPUT, str(quantity))
        time.sleep(1)  # Ждем пересчета БЖУ
        return self
    
    def get_quantity(self):
        """Получает текущее количество"""
        try:
            element = self.find_element_multiple(self.QUANTITY_INPUT, timeout=5)
            return element.text if element else None
        except:
            return None
    
    def enter_calories(self, calories):
        """Вводит калории"""
        self.clear_and_type_multiple(self.CALORIES_INPUT, str(calories))
        return self
    
    def get_calories(self):
        """
        Получает текущие калории (оптимизировано)
        
        Использует короткий таймаут и оптимизированный поиск для быстрого получения значения.
        """
        try:
            # Используем короткий таймаут для быстрого поиска
            element = self.find_element_multiple(self.CALORIES_INPUT, timeout=2)
            if element:
                try:
                    return element.text if element.text else None
                except Exception:
                    # Если text не доступен, пробуем получить значение через get_attribute
                    try:
                        return element.get_attribute('text') or element.get_attribute('value')
                    except Exception:
                        return None
            return None
        except Exception:
            return None
    
    def enter_proteins(self, proteins):
        """Вводит белки"""
        self.clear_and_type_multiple(self.PROTEINS_INPUT, str(proteins))
        return self
    
    def enter_fats(self, fats):
        """Вводит жиры"""
        self.clear_and_type_multiple(self.FATS_INPUT, str(fats))
        return self
    
    def enter_carbs(self, carbs):
        """Вводит углеводы"""
        self.clear_and_type_multiple(self.CARBS_INPUT, str(carbs))
        return self
    
    def clear_and_type_multiple(self, locators, text):
        """Очищает поле и вводит текст, пробуя несколько локаторов"""
        element = self.find_element_multiple(locators, timeout=5)
        if element:
            element.clear()
            element.send_keys(text)
    
    # ==========================================================================
    # MEAL TYPE SELECTION METHODS
    # ==========================================================================
    
    def select_meal_type(self, meal_type):
        """
        Выбирает тип приема пищи
        
        Args:
            meal_type: Тип ('BREAKFAST', 'LUNCH', 'DINNER', 'SUPPER', 'LATE_SUPPER', 'SNACK')
                      или на русском ('Завтрак', 'Обед', 'Ужин', 'Полдник', 'Поздний ужин', 'Перекус')
        """
        # Маппинг русских названий на enum
        ru_to_enum = {
            'Завтрак': 'BREAKFAST',
            'Обед': 'LUNCH',
            'Ужин': 'DINNER',
            'Полдник': 'SUPPER',
            'Поздний ужин': 'LATE_SUPPER',
            'Перекус': 'SNACK',
        }
        
        # Конвертируем если передано на русском
        if meal_type in ru_to_enum:
            meal_type = ru_to_enum[meal_type]
        
        meal_type = meal_type.upper()
        
        if meal_type in self.MEAL_TYPES:
            self.click_multiple(self.MEAL_TYPES[meal_type])
            time.sleep(0.5)
        else:
            raise ValueError(f"Unknown meal type: {meal_type}")
        
        return self
    
    def get_selected_meal_type(self):
        """
        Получает текущий выбранный тип приема пищи
        
        Returns:
            str: Тип на русском или None
        """
        # Проверяем каждый тип на наличие "активного" стиля
        # Или можно проверить summary текст
        try:
            summary = self.get_summary_text()
            if summary:
                for ru_name in ['Завтрак', 'Обед', 'Ужин', 'Полдник', 'Поздний ужин', 'Перекус']:
                    if ru_name in summary:
                        return ru_name
        except:
            pass
        return None
    
    # ==========================================================================
    # SUMMARY METHODS
    # ==========================================================================
    
    def get_summary_text(self):
        """
        Получает текст summary (Итого: 100 г • 52 ккал • Завтрак)
        
        Returns:
            str: Текст summary или None
        """
        try:
            return self.get_text(self.SUMMARY_TEXT)
        except:
            return None
    
    # ==========================================================================
    # ACTION METHODS
    # ==========================================================================
    
    def click_add_button(self, wait_for_main_screen=True, handle_confirm_dialog='create_new'):
        """
        Кликает на кнопку "Добавить блюдо" / "Сохранить изменения"
        Создает meal element и возвращает на MainScreen
        
        Args:
            wait_for_main_screen: Ждать ли перехода на главный экран
            handle_confirm_dialog: Как обрабатывать модальное окно подтверждения:
                - 'create_new' - создать новый прием (по умолчанию)
                - 'add_to_existing' - добавить к существующему
                - 'cancel' - отменить
                - None - не обрабатывать (если диалог не ожидается)
        """
        import time as t
        print(f"[CLICK_ADD] Начинаем клик на кнопку добавления...")
        click_start = t.time()
        try:
            self.click_multiple(self.ADD_BUTTON)
            click_duration = (t.time() - click_start) * 1000
            print(f"[CLICK_ADD] ✓ Кнопка добавления кликнута за {click_duration:.0f}ms")
        except Exception as e:
            click_duration = (t.time() - click_start) * 1000
            print(f"[CLICK_ADD] ✗ Ошибка при клике за {click_duration:.0f}ms: {e}")
            raise
        
        # Оптимизированное ожидание модального окна - проверяем быстрее
        # Сокращено время проверки: если модальное окно не появилось за 0.5s, его нет
        dialog_check_start = t.time()
        dialog_visible = False
        max_check_time = 0.5  # Сокращено с 1.0s до 0.5s (модальное окно появляется быстро или не появляется)
        max_attempts = 5  # Максимум 0.5 секунды (5 * 0.1)
        
        # Быстрая проверка: пробуем только 2 раза с короткими таймаутами
        for attempt in range(max_attempts):
            elapsed = t.time() - dialog_check_start
            if elapsed > max_check_time:
                break
            
            # Короткая пауза между проверками
            if attempt > 0:
                time.sleep(0.1)
            
            # Очень короткий таймаут для проверки (0.1s)
            try:
                if self.is_confirm_dialog_visible(timeout=0.1):
                    dialog_visible = True
                    dialog_check_duration = (t.time() - dialog_check_start) * 1000
                    print(f"[CLICK_ADD] ✓ Модальное окно обнаружено за {dialog_check_duration:.0f}ms")
                    break
            except Exception:
                # Игнорируем исключения при быстрой проверке
                pass
        
        if not dialog_visible:
            dialog_check_duration = (t.time() - dialog_check_start) * 1000
            # Логируем только если проверка заняла заметное время (>100ms)
            if dialog_check_duration > 100:
                print(f"[CLICK_ADD] Модальное окно не обнаружено (проверка заняла {dialog_check_duration:.0f}ms)")
        
        # Проверяем наличие модального окна подтверждения
        if handle_confirm_dialog and dialog_visible:
            print(f"Обнаружено модальное окно подтверждения, выбираем: {handle_confirm_dialog}")
            if handle_confirm_dialog == 'create_new':
                self.confirm_create_new_meal()
            elif handle_confirm_dialog == 'add_to_existing':
                self.confirm_add_to_existing_meal()
            elif handle_confirm_dialog == 'cancel':
                self.cancel_confirmation()
                return self
        
        if wait_for_main_screen:
            # Оптимизация: используем быструю проверку главного экрана
            from pages.main_page import MainPage
            main_page = MainPage(self.driver)
            
            transition_start = t.time()
            print(f"[CLICK_ADD] Проверка перехода на главный экран...")
            
            # Быстрая проверка (0.2s) - может мы уже на главном?
            # Используем is_on_main_page_fast для очень быстрой проверки
            try:
                if main_page.is_on_main_page_fast(timeout=0.2):
                    transition_duration = (t.time() - transition_start) * 1000
                    print(f"[CLICK_ADD] ✓ Уже на главном экране (проверка заняла {transition_duration:.0f}ms)")
                    return self
            except Exception as e:
                # Игнорируем исключения при быстрой проверке
                pass
            
            # Если не на главном - ждем перехода с оптимизированным методом
            print(f"[CLICK_ADD] Ожидание перехода на главный экран (таймаут 3s)...")
            try:
                transition_result = self._wait_for_transition_to_main(timeout=3)
                transition_duration = (t.time() - transition_start) * 1000
                if transition_result:
                    print(f"[CLICK_ADD] ✓ Переход на главный экран завершен за {transition_duration:.0f}ms")
                else:
                    print(f"[CLICK_ADD] ⚠ Переход на главный экран не подтвержден за {transition_duration:.0f}ms")
            except Exception as e:
                transition_duration = (t.time() - transition_start) * 1000
                print(f"[CLICK_ADD] ✗ Ошибка при ожидании перехода за {transition_duration:.0f}ms: {e}")
                # Продолжаем выполнение, даже если переход не подтвержден
        else:
            time.sleep(0.3)  # Уменьшили с 0.5 до 0.3
        
        return self
    
    def _wait_for_transition_to_main(self, timeout=5):
        """
        Ждет перехода на главный экран после добавления (оптимизировано)
        
        Использует быструю проверку наличия элементов главного экрана вместо
        ожидания исчезновения кнопки.
        
        Args:
            timeout: Максимальное время ожидания
        """
        import time as t
        from pages.main_page import MainPage
        from config.appium_config import DETAILED_ELEMENT_LOGGING
        
        start = t.time()
        poll_interval = 0.1  # Уменьшили с 0.2 до 0.1 для более частой проверки
        main_page = MainPage(self.driver)
        log_search = DETAILED_ELEMENT_LOGGING
        
        if log_search:
            print(f"[TRANSITION] Ожидание перехода на главный экран (timeout={timeout}s)")
        
        # Устанавливаем короткий implicit wait один раз
        self.driver.implicitly_wait(0.1)
        
        try:
            while t.time() - start < timeout:
                # Используем is_on_main_page_fast для быстрой проверки
                try:
                    if main_page.is_on_main_page_fast(timeout=0.1):
                        elapsed = (t.time() - start) * 1000
                        if log_search:
                            print(f"[TRANSITION] ✓ Переход обнаружен за {elapsed:.0f}ms")
                        time.sleep(0.1)  # Небольшая задержка для стабилизации
                        return True
                except Exception:
                    pass
                
                # Альтернативная быстрая проверка: заголовок "Расписание"
                try:
                    schedule_elements = self.driver.find_elements(By.XPATH, "//*[@text='Расписание']")
                    if schedule_elements:
                        for el in schedule_elements:
                            try:
                                if el.is_displayed():
                                    elapsed = (t.time() - start) * 1000
                                    if log_search:
                                        print(f"[TRANSITION] ✓ Переход обнаружен за {elapsed:.0f}ms (найден 'Расписание')")
                                    time.sleep(0.1)
                                    return True
                            except Exception:
                                continue
                except Exception:
                    pass
                
                # Альтернативная проверка: FAB кнопка (если видна - мы на главном)
                try:
                    fab_elements = self.driver.find_elements(By.XPATH, "//*[@content-desc='Добавить прием пищи']")
                    if fab_elements:
                        for el in fab_elements:
                            try:
                                if el.is_displayed():
                                    elapsed = (t.time() - start) * 1000
                                    if log_search:
                                        print(f"[TRANSITION] ✓ Переход обнаружен за {elapsed:.0f}ms (найдена FAB)")
                                    time.sleep(0.1)
                                    return True
                            except Exception:
                                continue
                except Exception:
                    pass
                
                # Проверяем что кнопка "Добавить блюдо" исчезла (fallback)
                try:
                    buttons = self.driver.find_elements(By.XPATH, "//*[@text='Добавить блюдо']")
                    if not buttons or len(buttons) == 0:
                        # Кнопка исчезла - возможно перешли, но проверим еще раз главный экран
                        # Используем быструю проверку вместо is_page_loaded
                        if main_page.is_on_main_page_fast(timeout=0.2):
                            elapsed = (t.time() - start) * 1000
                            if log_search:
                                print(f"[TRANSITION] ✓ Переход подтвержден за {elapsed:.0f}ms (is_on_main_page_fast)")
                            return True
                except Exception:
                    pass
                
                time.sleep(poll_interval)
        finally:
            # Восстанавливаем implicit wait
            self.driver.implicitly_wait(10)
        
        # Если таймаут - пробуем финальную проверку главного экрана
        elapsed = (t.time() - start) * 1000
        if log_search:
            print(f"[TRANSITION] ⚠ Таймаут ({timeout}s), финальная проверка...")
        try:
            # Используем быструю проверку для финальной проверки
            if main_page.is_on_main_page_fast(timeout=0.5):
                if log_search:
                    print(f"[TRANSITION] ✓ Переход подтвержден после таймаута за {elapsed:.0f}ms")
                return True
        except:
            pass
        
        print(f"[TRANSITION] ✗ Timeout waiting for transition to main screen ({elapsed:.0f}ms)")
        return False
    
    def click_save_as_product(self):
        """Кликает на кнопку "Сохранить как продукт" (режим редактирования)"""
        self.click_multiple(self.SAVE_AS_PRODUCT_BUTTON)
        time.sleep(2)
        return self
    
    def add_product_to_meal(self, quantity=None, meal_type=None):
        """
        Полный процесс добавления продукта в прием пищи
        
        Args:
            quantity: Количество в граммах (опционально)
            meal_type: Тип приема пищи (опционально)
        """
        if quantity:
            self.enter_quantity(quantity)
        
        if meal_type:
            self.select_meal_type(meal_type)
        
        self.click_add_button()
        return self
    
    # ==========================================================================
    # CONFIRMATION DIALOG METHODS
    # ==========================================================================
    
    def is_confirm_dialog_visible(self, timeout=0.3):
        """
        Проверяет, видим ли диалог подтверждения (оптимизировано с использованием find_elements)
        
        Использует find_elements вместо WebDriverWait для быстрой проверки без ожидания полного таймаута.
        
        Args:
            timeout: Таймаут проверки (по умолчанию 0.3s для быстрой проверки)
        
        Returns:
            bool: True если диалог видим, False если нет или таймаут
        """
        import time as t
        start = t.time()
        
        try:
            # Устанавливаем короткий implicit wait для быстрого поиска
            self.driver.implicitly_wait(0.1)  # Очень короткий таймаут
            
            try:
                # Используем find_elements для быстрой проверки без ожидания полного таймаута
                # Проверяем каждый локатор до тех пор, пока не найдем видимый элемент или не истечет время
                for locator in self.CONFIRM_DIALOG:
                    # Проверяем, не превышен ли общий таймаут
                    elapsed = t.time() - start
                    if elapsed > timeout:
                        break
                    
                    try:
                        # Используем find_elements для быстрого поиска
                        elements = self.driver.find_elements(locator[0], locator[1])
                        
                        # Проверяем видимость первого найденного элемента
                        for element in elements:
                            try:
                                if element.is_displayed():
                                    elapsed = (t.time() - start) * 1000
                                    if elapsed > timeout * 1000 * 1.2:
                                        print(f"[DIALOG_CHECK] ⚠ Долгая проверка: {elapsed:.0f}ms")
                                    return True
                            except Exception:
                                continue
                    except Exception:
                        continue
                
                elapsed = (t.time() - start) * 1000
                # Логируем только если проверка заняла больше ожидаемого
                if elapsed > timeout * 1000 * 1.5:
                    print(f"[DIALOG_CHECK] ⚠ Долгая проверка модального окна: {elapsed:.0f}ms (таймаут был {timeout*1000:.0f}ms)")
                
                return False
            finally:
                # Восстанавливаем implicit wait
                self.driver.implicitly_wait(10)
        except Exception as e:
            elapsed = (t.time() - start) * 1000
            if elapsed > timeout * 1000 * 1.5:
                print(f"[DIALOG_CHECK] ⚠ Исключение при проверке модального окна за {elapsed:.0f}ms: {e}")
            return False
    
    def confirm_add_to_existing_meal(self):
        """Подтверждает добавление к существующему приему пищи"""
        self.click_multiple(self.CONFIRM_ADD_TO_EXISTING)
        time.sleep(2)
        return self
    
    def confirm_create_new_meal(self):
        """Подтверждает создание нового приема пищи"""
        self.click_multiple(self.CONFIRM_CREATE_NEW)
        time.sleep(2)
        return self
    
    def cancel_confirmation(self):
        """Отменяет диалог подтверждения"""
        self.click_multiple(self.CONFIRM_CANCEL)
        time.sleep(1)
        return self
    
    # ==========================================================================
    # NAVIGATION METHODS
    # ==========================================================================
    
    def go_back(self):
        """Возвращается на предыдущий экран (SearchScreen)"""
        try:
            self.click_multiple(self.HEADER_BACK_BUTTON)
        except:
            self.driver.back()
        time.sleep(2)
        return self
