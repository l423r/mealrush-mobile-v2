"""
Page Object для экрана приема пищи (MealScreen)
Story 3.1: Create Meal Entry

UI Structure (MealScreen.tsx):
- Header с названием типа приема пищи и временем
- Список продуктов (MealElements) в FlashList
- Summary с калориями и БЖУ
- FAB кнопка для добавления продуктов
- Кнопка редактирования (edit/pencil)
- Кнопка удаления (delete/trash)

User Flow:
MainScreen → Клик на MealCard → MealScreen → Просмотр/редактирование приема пищи
"""
import os
import re
import sys
import time
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MealPage(BasePage):
    """Класс для работы с экраном деталей приема пищи (MealScreen)"""
    
    # ==========================================================================
    # LOCATORS - основанные на реальном MealScreen.tsx
    # ==========================================================================
    
    # Header локаторы
    HEADER_BACK_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "Назад"),
        (By.XPATH, "//*[@content-desc='Назад']"),
        (By.XPATH, "//android.widget.ImageButton"),  # Back button
    ]
    
    # Заголовок с типом приема пищи (Завтрак, Обед, и т.д.)
    MEAL_TYPE_TITLE = (By.XPATH, "//*[@resource-id='meal_type_title' or contains(@text, 'Завтрак') or contains(@text, 'Обед') or contains(@text, 'Ужин') or contains(@text, 'Полдник') or contains(@text, 'Поздний ужин') or contains(@text, 'Перекус')]")
    
    # Все типы приемов пищи для проверки
    MEAL_TYPE_INDICATORS = [
        (By.XPATH, "//*[@text='Завтрак']"),      # BREAKFAST
        (By.XPATH, "//*[@text='Обед']"),         # LUNCH  
        (By.XPATH, "//*[@text='Ужин']"),         # DINNER
        (By.XPATH, "//*[@text='Полдник']"),      # SUPPER
        (By.XPATH, "//*[@text='Поздний ужин']"), # LATE_SUPPER
        (By.XPATH, "//*[@text='Перекус']"),      # SNACK - NEW!
    ]
    
    # Время приема пищи (формат HH:MM)
    MEAL_TIME = (By.XPATH, "//*[contains(@text, ':') and string-length(@text) = 5]")
    
    # ==========================================================================
    # FAB и Action Buttons
    # ==========================================================================
    
    # FAB кнопка для добавления продуктов (+)
    # Оптимизировано: сначала пробуем рабочие локаторы, затем fallback
    ADD_PRODUCT_FAB = [
        # По accessibilityLabel (работает стабильно)
        (AppiumBy.ACCESSIBILITY_ID, "Добавить продукт"),
        # По testID (если приложение пересобрано с testID)
        (AppiumBy.ACCESSIBILITY_ID, "meal_add_product_fab"),
        # По content-desc (fallback)
        (By.XPATH, "//*[@content-desc='Добавить продукт']"),
        (By.XPATH, "//*[@content-desc='meal_add_product_fab']"),
    ]
    
    # Кнопка редактирования (в header)
    EDIT_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "Редактировать"),
        (By.XPATH, "//*[@content-desc='create' or @content-desc='edit']"),
        (By.XPATH, "//*[contains(@content-desc, 'pencil') or contains(@content-desc, 'create')]"),
        # Иконка редактирования (карандаш) в header
        (By.XPATH, "//android.view.ViewGroup[.//*[contains(@content-desc, 'create')]]"),
    ]
    
    # Кнопка меню действий (три точки) в header - открывает MealActionsMenu
    # Находится справа в header, после кнопки редактирования (карандаш)
    # Структура: Header -> rightComponent -> headerActions -> menuButton (последний TouchableOpacity)
    ACTIONS_MENU_BUTTON = [
        # Ищем последний кликабельный элемент в header справа (после кнопки редактирования)
        # Ищем все кликабельные элементы в header и берем последний
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Завтрак' or @text='Обед' or @text='Ужин' or @text='Полдник' or @text='Поздний ужин' or @text='Перекус']]/ancestor::android.view.ViewGroup[1]//android.view.ViewGroup[@clickable='true'][last()]"),
        # Ищем последний ViewGroup в header actions (справа от заголовка)
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Завтрак' or @text='Обед' or @text='Ужин' or @text='Полдник' or @text='Поздний ужин' or @text='Перекус']]/following-sibling::android.view.ViewGroup//android.view.ViewGroup[@clickable='true'][last()]"),
        # Ищем по времени в subtitle (формат HH:MM) - после него идут кнопки действий
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, ':') and string-length(@text) = 5]]/ancestor::android.view.ViewGroup[1]//android.view.ViewGroup[@clickable='true'][last()]"),
        # Ищем все кликабельные элементы в верхней части экрана (y < 200) и берем последний
        (By.XPATH, "//android.view.ViewGroup[@clickable='true'][@bounds[contains(., 'y<200')]]"),
        # Fallback: ищем любую кнопку справа в header по позиции
        (By.XPATH, "//*[@content-desc='Меню действий' or contains(@content-desc, 'menu') or contains(@content-desc, 'ellipsis')]"),
    ]
    
    # Опция "Удалить" в меню действий (MealActionsMenu)
    # Выделена красным цветом в модальном окне
    # Порядок оптимизирован: более специфичные локаторы первыми для быстрого поиска
    DELETE_MENU_ITEM = [
        # Самый специфичный - точный текст в модальном окне
        (By.XPATH, "//android.widget.Modal//android.widget.TextView[@text='Удалить']"),
        # TouchableOpacity с текстом "Удалить" (кликабельный контейнер)
        (By.XPATH, "//android.view.ViewGroup[@clickable='true'][.//android.widget.TextView[@text='Удалить']]"),
        # TextView с текстом "Удалить" (может быть не в Modal)
        (By.XPATH, "//android.widget.TextView[@text='Удалить']"),
        # ViewGroup с текстом "Удалить" (любой контейнер)
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Удалить']]"),
        # Fallback: любой элемент с текстом "Удалить" (самый общий)
        (By.XPATH, "//*[@text='Удалить' or contains(@text, 'Удалить')]"),
        # По content-desc (самый общий)
        (By.XPATH, "//*[contains(@content-desc, 'Удалить') or contains(@content-desc, 'delete')]"),
    ]
    
    # Кнопка удаления элемента приема пищи (красная корзина на карточке элемента)
    DELETE_ELEMENT_BUTTON = [
        # Ищем иконку корзины (trash) на карточке элемента
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, 'ккал')]]//*[contains(@content-desc, 'trash') or contains(@content-desc, 'delete')]"),
        # Ищем кнопку удаления в карточке элемента (обычно справа)
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, 'ккал')]]//android.view.ViewGroup[last()]//android.view.ViewGroup[last()]"),
        # Fallback: ищем любую кнопку с иконкой корзины
        (By.XPATH, "//*[contains(@content-desc, 'trash') or contains(@content-desc, 'delete')]"),
    ]
    
    # Кнопка удаления приема пищи (legacy - для обратной совместимости)
    DELETE_BUTTON = [
        (By.XPATH, "//*[@text='Удалить' or contains(@text, 'Удалить')]"),
        (AppiumBy.ACCESSIBILITY_ID, "Удалить"),
        (By.XPATH, "//*[@content-desc='delete' or @content-desc='trash']"),
        (By.XPATH, "//*[contains(@content-desc, 'delete') or contains(@content-desc, 'trash')]"),
    ]
    
    # ==========================================================================
    # Meal Elements (список продуктов)
    # ==========================================================================
    
    # Карточка продукта в приеме пищи
    # Приоритет: testID (быстрый и надежный) -> XPath (fallback)
    MEAL_ELEMENT_CARD = [
        # Используем testID для надежного поиска (добавлен в MealElementItem.tsx)
        (AppiumBy.ACCESSIBILITY_ID, "meal_element_item"),  # Частичное совпадение для всех элементов
        (By.XPATH, "//*[starts-with(@content-desc, 'meal_element_item_')]"),  # По testID через content-desc
        # Fallback: XPath по структуре (для обратной совместимости)
        (By.XPATH, "//*[contains(@text, 'ккал')]/ancestor::android.view.ViewGroup[1]"),
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, 'ккал')]]"),
    ]
    
    # Название продукта
    PRODUCT_NAME = (By.XPATH, "//android.widget.TextView[not(contains(@text, 'ккал')) and not(contains(@text, 'г'))]")
    
    # Количество продукта (граммы)
    PRODUCT_QUANTITY = (By.XPATH, "//*[contains(@text, ' г')]")
    
    # Калории продукта
    PRODUCT_CALORIES = (By.XPATH, "//*[contains(@text, 'ккал')]")
    
    # ==========================================================================
    # Summary Section (сводка по приему пищи)
    # ==========================================================================
    
    SUMMARY_TOTAL_CALORIES = (By.XPATH, "//*[contains(@text, 'ккал')]")
    SUMMARY_PROTEINS = (By.XPATH, "//*[contains(@text, 'Б') or contains(@text, 'Белки')]")
    SUMMARY_FATS = (By.XPATH, "//*[contains(@text, 'Ж') or contains(@text, 'Жиры')]")
    SUMMARY_CARBS = (By.XPATH, "//*[contains(@text, 'У') or contains(@text, 'Углеводы')]")
    
    # ==========================================================================
    # Empty State
    # ==========================================================================
    
    EMPTY_STATE_TEXT = [
        (By.XPATH, "//*[contains(@text, 'Нет продуктов')]"),
        (By.XPATH, "//*[contains(@text, 'Добавьте продукты')]"),
        (By.XPATH, "//*[contains(@text, 'пусто')]"),
    ]
    
    # ==========================================================================
    # Dialogs
    # ==========================================================================
    
    DELETE_CONFIRM_DIALOG = [
        (By.XPATH, "//*[contains(@text, 'Удаление приема пищи')]"),
        (By.XPATH, "//*[contains(@text, 'Удалить')]"),
    ]
    DELETE_CONFIRM_YES = [
        # Кнопка "Подтвердить" в диалоге удаления (AlertDialog)
        # Оптимизированный порядок: рабочие локаторы первыми
        (By.XPATH, "//*[@text='Подтвердить' or contains(@text, 'Подтвердить')]"),  # Рабочий (найден в логах)
        (By.XPATH, "//android.widget.TextView[@text='Подтвердить']"),  # Быстрый fallback
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Подтвердить']]"),
        # Медленные локаторы в конце (редко используются)
        (By.XPATH, "//android.widget.Modal//android.widget.TextView[@text='Подтвердить']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Да') or contains(@text, 'Подтвердить')]"),
        # Старые варианты для обратной совместимости (в самом конце)
        (By.XPATH, "//*[@text='Да' or @text='Удалить' or @text='OK' or @text='ОК']"),
        # alert_confirm_button не работает в Android - убран
    ]
    DELETE_CONFIRM_NO = [
        (By.XPATH, "//*[@text='Нет' or @text='Отмена' or @text='Cancel']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Нет')]"),
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.MEAL_TYPE_INDICATORS
    
    # ==========================================================================
    # PAGE STATE METHODS
    # ==========================================================================
    
    def is_page_loaded(self, timeout=10):
        """
        Проверяет, загрузилась ли страница деталей приема пищи
        
        Проверяем наличие:
        1. Заголовка с типом приема пищи (Завтрак, Обед, etc.)
        2. FAB кнопки добавления
        """
        # Проверяем наличие заголовка типа приема пищи
        for indicator in self.MEAL_TYPE_INDICATORS:
            try:
                if self.is_displayed(indicator, timeout=2):
                    return True
            except:
                continue
        
        # Альтернативная проверка - FAB кнопка
        try:
            if self.is_displayed_multiple(self.ADD_PRODUCT_FAB, timeout=2):
                return True
        except:
            pass
        
        return False
    
    def is_meal_empty(self):
        """Проверяет, пустой ли прием пищи (нет продуктов)"""
        # Проверяем наличие empty state текста
        for locator in self.EMPTY_STATE_TEXT:
            try:
                if self.is_displayed(locator, timeout=2):
                    return True
            except:
                continue
        
        # Или проверяем количество элементов
        return self.get_elements_count() == 0
    
    # ==========================================================================
    # MEAL TYPE METHODS
    # ==========================================================================
    
    def get_meal_type(self):
        """
        Получает тип приема пищи из заголовка
        
        Returns:
            str: Тип приема пищи (Завтрак, Обед, etc.) или None
        """
        for indicator in self.MEAL_TYPE_INDICATORS:
            try:
                if self.is_displayed(indicator, timeout=1):
                    return self.get_text(indicator)
            except:
                continue
        return None
    
    def is_snack_meal(self):
        """Проверяет, является ли текущий прием пищи типа SNACK (Перекус)"""
        meal_type = self.get_meal_type()
        return meal_type == 'Перекус' if meal_type else False
    
    # ==========================================================================
    # TIME METHODS
    # ==========================================================================
    
    def get_meal_time(self):
        """
        Получает время приема пищи (формат HH:MM)
        
        Returns:
            str: Время или None
        """
        try:
            return self.get_text(self.MEAL_TIME)
        except:
            return None
    
    # ==========================================================================
    # MEAL ELEMENTS METHODS
    # ==========================================================================
    
    def get_elements_count(self, debug=False):
        """
        Получает количество продуктов в приеме пищи
        
        ВАЖНО: Этот метод работает ТОЛЬКО на MealScreen, не на главном экране!
        На главном экране находятся карточки приемов пищи (MealCard), а не продукты.
        
        Использует testID для надежного поиска продуктов (meal_element_item_*)
        Исключает Summary (сводку) с общими калориями
        
        Args:
            debug: Если True, выводит отладочную информацию
        
        Returns:
            int: Количество продуктов (без учета Summary)
        """
        # Проверяем, что мы на MealScreen, а не на главном экране
        if not self.is_page_loaded(timeout=1):
            if debug:
                print("[get_elements_count] ⚠ MealScreen не загружен, возможно мы на другом экране")
            return 0
        try:
            # Сначала пытаемся найти по testID (надежный метод)
            # В Android testID преобразуется в content-desc
            try:
                # Ищем все элементы с content-desc, начинающимся с "meal_element_item_"
                testid_elements = self.driver.find_elements(
                    By.XPATH, 
                    "//*[starts-with(@content-desc, 'meal_element_item_')]"
                )
                if testid_elements:
                    count = len(testid_elements)
                    if debug:
                        print(f"[get_elements_count] Найдено по testID: {count} продуктов")
                    return count
            except Exception as e:
                if debug:
                    print(f"[get_elements_count] Поиск по testID не удался: {e}, используем fallback")
            
            # Fallback: используем старый метод с фильтрацией
            elements = self.find_elements_multiple(self.MEAL_ELEMENT_CARD)
            if not elements:
                if debug:
                    print(f"[get_elements_count] Элементы не найдены")
                return 0
            
            # Фильтруем элементы: исключаем Summary (сводку)
            product_elements = []
            for idx, elem in enumerate(elements):
                try:
                    # Проверяем content-desc (testID) - если есть "meal_element_item_", это точно продукт
                    content_desc = elem.get_attribute('content-desc') or ''
                    if 'meal_element_item_' in content_desc:
                        product_elements.append(elem)
                        if debug:
                            print(f"[get_elements_count] [{idx}] Найден продукт по testID: {content_desc}")
                        continue
                    
                    # Получаем весь текст элемента (включая дочерние элементы)
                    text = elem.text if hasattr(elem, 'text') else elem.get_attribute('text') or ''
                    
                    # Также получаем текст всех дочерних элементов для более полной проверки
                    try:
                        child_texts = []
                        child_elements = elem.find_elements(By.XPATH, ".//android.widget.TextView")
                        for child in child_elements:
                            child_text = child.text or child.get_attribute('text') or ''
                            if child_text:
                                child_texts.append(child_text)
                        full_text = ' '.join([text] + child_texts) if child_texts else text
                    except:
                        full_text = text
                    
                    if not full_text:
                        if debug:
                            print(f"[get_elements_count] [{idx}] Элемент без текста, пропускаем")
                        continue
                    
                    # Получаем позицию элемента
                    location = elem.location
                    y_position = location.get('y', 0) if location else 0
                    
                    if debug:
                        print(f"[get_elements_count] [{idx}] Анализ элемента (y={y_position}): {full_text[:80]}...")
                    
                    # КРИТЕРИЙ 1: Summary содержит разделитель "|" (Б: ... | Ж: ... | У: ...)
                    # Это главный признак Summary - он ВСЕГДА содержит "|" между значениями
                    if '|' in full_text:
                        if debug:
                            print(f"[get_elements_count] [{idx}] Пропущен Summary (содержит '|'): {full_text[:50]}...")
                        continue
                    
                    # КРИТЕРИЙ 2: Проверяем наличие названия продукта
                    # Название продукта - это слово из букв (латиница или кириллица), не только числа
                    # Примеры: "Beef", "Говядина", "Банан" и т.д.
                    # Убираем все служебные символы и проверяем наличие букв
                    text_for_name_check = full_text.replace('Б:', '').replace('Ж:', '').replace('У:', '').replace('г', '').replace('ккал', '').replace('·', '').replace(' ', '')
                    # Ищем слова из букв (не только цифры и БЖУ)
                    words = text_for_name_check.split()
                    has_product_name = False
                    product_name = None
                    
                    for word in words:
                        # Проверяем, есть ли в слове буквы (не только цифры и служебные символы)
                        if word and any(char.isalpha() and char not in 'БЖУг' for char in word):
                            # Проверяем, что это не только числа с точкой (например, "18.2")
                            if not word.replace('.', '').replace(',', '').isdigit():
                                has_product_name = True
                                product_name = word
                                break
                    
                    # КРИТЕРИЙ 3: Summary в верхней части БЕЗ названия продукта
                    if y_position < 400:
                        if 'Б:' in full_text and 'Ж:' in full_text and 'У:' in full_text:
                            if not has_product_name:
                                if debug:
                                    print(f"[get_elements_count] [{idx}] Пропущен Summary (верхняя часть y={y_position}, нет названия продукта): {full_text[:50]}...")
                                continue
                            else:
                                if debug:
                                    print(f"[get_elements_count] [{idx}] Найден продукт в верхней части (y={y_position}, название: {product_name}): {full_text[:50]}...")
                    
                    # Если элемент прошел все фильтры - это продукт
                    product_elements.append(elem)
                    if debug:
                        print(f"[get_elements_count] [{idx}] ✓ Найден продукт (y={y_position}, название: {product_name}): {full_text[:50]}...")
                except Exception as e:
                    if debug:
                        print(f"[get_elements_count] [{idx}] Ошибка при обработке элемента: {e}")
                        import traceback
                        traceback.print_exc()
                    continue
            
            count = len(product_elements)
            if debug:
                print(f"[get_elements_count] Итого продуктов: {count} (всего элементов: {len(elements)})")
            return count
        except Exception as e:
            if debug:
                print(f"[get_elements_count] Ошибка: {e}")
            return 0
    
    def click_element(self, index=0):
        """
        Кликает на продукт по индексу для просмотра деталей
        
        Args:
            index: Индекс продукта (0-based)
        """
        try:
            elements = self.find_elements_multiple(self.MEAL_ELEMENT_CARD)
            if elements and index < len(elements):
                elements[index].click()
                time.sleep(2)
        except Exception as e:
            print(f"Could not click element at index {index}: {e}")
        return self
    
    def get_element_name(self, index=0):
        """Получает название продукта по индексу"""
        try:
            elements = self.find_elements_multiple(self.MEAL_ELEMENT_CARD)
            if elements and index < len(elements):
                # Ищем текст без калорий и граммов
                name_elements = elements[index].find_elements(*self.PRODUCT_NAME)
                if name_elements:
                    return name_elements[0].text
        except:
            pass
        return None
    
    # ==========================================================================
    # ACTION METHODS
    # ==========================================================================
    
    def click_add_product(self, debug=False):
        """
        Кликает на FAB для добавления продукта
        Открывает SearchScreen
        
        Args:
            debug: Если True, выводит отладочную информацию
        
        Returns:
            self
        """
        if debug:
            print("[click_add_product] Поиск FAB кнопки для добавления продукта...")
        
        # Пробуем найти FAB кнопку (оптимизировано: без лишних попыток)
        fab_found = False
        for locator in self.ADD_PRODUCT_FAB:
            try:
                if isinstance(locator, tuple):
                    by, value = locator
                    if debug:
                        print(f"[click_add_product] Пробуем локатор: {by} = {value}")
                    
                    # Используем короткий таймаут для быстрого поиска
                    self.driver.implicitly_wait(1)
                    try:
                        if by == AppiumBy.ACCESSIBILITY_ID:
                            element = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, value)
                        else:
                            element = self.driver.find_element(by, value)
                        
                        if element and element.is_displayed():
                            if debug:
                                location = element.location
                                size = element.size
                                print(f"[click_add_product] ✓ FAB найден: {by} = {value}, позиция: {location}, размер: {size}")
                            element.click()
                            fab_found = True
                            break
                    finally:
                        self.driver.implicitly_wait(10)
            except Exception:
                # Не логируем каждую неудачную попытку (только в debug режиме)
                if debug:
                    print(f"[click_add_product] Локатор не сработал: {by} = {value}")
                continue
        
        if not fab_found:
            # Делаем скриншот для отладки
            self.take_screenshot('error_fab_not_found')
            raise Exception("FAB кнопка для добавления продукта не найдена")
        
        time.sleep(1)  # Даем время на навигацию
        return self
    
    def click_edit(self):
        """Кликает на кнопку редактирования приема пищи"""
        self.click_multiple(self.EDIT_BUTTON)
        time.sleep(2)
        return self
    
    def click_delete(self):
        """
        Кликает на кнопку удаления приема пищи
        Сначала открывает меню действий (три точки), затем выбирает опцию "Удалить"
        Показывает диалог подтверждения
        """
        print("[click_delete] Открываем меню действий (три точки)...")
        
        # Сначала открываем меню действий (три точки)
        # Пробуем разные стратегии поиска
        menu_found = False
        
        # Стратегия 1: Ищем последний кликабельный элемент в header (самый правый)
        try:
            print("[click_delete] Стратегия 1: Ищем последний кликабельный элемент в header...")
            # Ищем все кликабельные элементы в верхней части экрана
            all_clickable = self.driver.find_elements(By.XPATH, "//android.view.ViewGroup[@clickable='true']")
            header_buttons = []
            for btn in all_clickable:
                try:
                    y_pos = btn.location['y']
                    # Кнопки в header обычно находятся в верхней части (y < 200)
                    if y_pos < 200:
                        x_pos = btn.location['x']
                        header_buttons.append((btn, x_pos, y_pos))
                except:
                    continue
            
            if header_buttons:
                # Сортируем по X-позиции (справа налево) и берем самый правый
                header_buttons.sort(key=lambda x: x[1], reverse=True)
                # Берем последний (самый правый) элемент - это должна быть кнопка меню
                menu_button = header_buttons[0][0]
                menu_button.click()
                print(f"[click_delete] ✓ Меню действий найдено и кликнуто (стратегия 1, x={header_buttons[0][1]}, y={header_buttons[0][2]})")
                menu_found = True
                time.sleep(1.5)  # Ждем открытия модального окна меню
        except Exception as e:
            print(f"[click_delete] ⚠ Стратегия 1 не сработала: {e}")
        
        # Стратегия 2: Используем стандартные локаторы
        if not menu_found:
            try:
                print("[click_delete] Стратегия 2: Используем стандартные локаторы...")
                self.click_multiple(self.ACTIONS_MENU_BUTTON, timeout=5)
                print("[click_delete] ✓ Меню действий открыто (стратегия 2)")
                menu_found = True
                time.sleep(1.5)  # Ждем открытия модального окна меню
            except Exception as e:
                print(f"[click_delete] ⚠ Стратегия 2 не сработала: {e}")
        
        if not menu_found:
            print("[click_delete] ✗ Не удалось открыть меню действий ни одной стратегией")
            # Fallback: пробуем найти кнопку удаления напрямую
            try:
                print("[click_delete] Fallback: Пробуем найти кнопку удаления напрямую...")
                self.click_multiple(self.DELETE_BUTTON, timeout=2)
                time.sleep(1)
                return self
            except:
                raise Exception("Не удалось открыть меню действий и найти кнопку удаления")
        
        print("[click_delete] Ищем опцию 'Удалить' в меню...")
        # Затем кликаем на опцию "Удалить" в меню
        try:
            # Оптимизированный поиск опции "Удалить" с использованием find_elements для быстрой проверки
            delete_item_found = False
            
            # Устанавливаем короткий implicit wait для быстрого поиска
            self.driver.implicitly_wait(0.1)
            
            try:
                for i, locator in enumerate(self.DELETE_MENU_ITEM):
                    try:
                        print(f"[click_delete] Попытка {i+1}/{len(self.DELETE_MENU_ITEM)} найти 'Удалить': {self._format_locator(locator)} (timeout=0.5s)")
                        
                        # Используем find_elements для быстрого поиска без ожидания полного таймаута
                        elements = self.driver.find_elements(locator[0], locator[1])
                        
                        # Проверяем видимость первого найденного элемента
                        for element in elements:
                            try:
                                if element.is_displayed():
                                    location = element.location
                                    size = element.size
                                    text = element.text if hasattr(element, 'text') else ''
                                    print(f"[click_delete] ✓ Элемент 'Удалить' найден: '{text}' at ({location['x']}, {location['y']}), size={size['width']}x{size['height']}")
                                    element.click()
                                    delete_item_found = True
                                    print("[click_delete] ✓ Опция 'Удалить' выбрана")
                                    break
                            except Exception:
                                continue
                        
                        if delete_item_found:
                            break
                    except Exception as e:
                        print(f"[click_delete] ⚠ Локатор {i+1} не сработал: {e}")
                        continue
            finally:
                # Восстанавливаем implicit wait
                self.driver.implicitly_wait(10)
            
            if not delete_item_found:
                # Fallback на стандартный метод
                print("[click_delete] Fallback: используем click_multiple...")
                self.click_multiple(self.DELETE_MENU_ITEM, timeout=2)
            
            time.sleep(1.5)  # Ждем появления диалога подтверждения
            print("[click_delete] ✓ Ожидаем диалог подтверждения...")
            
            # Делаем скриншот диалога для отладки
            try:
                self.take_screenshot('delete_confirm_dialog')
            except:
                pass
        except Exception as e:
            print(f"[click_delete] ✗ Не удалось найти опцию 'Удалить' в меню: {e}")
            raise
        
        return self
    
    def delete_element(self, index=0, confirm=True):
        """
        Удаляет элемент приема пищи (блюдо) по индексу
        Кликает на красную иконку корзины на карточке элемента
        
        Args:
            index: Индекс элемента (0-based)
            confirm: Подтвердить ли удаление в диалоге (по умолчанию True)
        
        Returns:
            bool: True если элемент удален успешно
        """
        try:
            print(f"[delete_element] Удаляем элемент приема пищи (индекс {index})...")
            # Находим все карточки элементов
            elements = self.find_elements_multiple(self.MEAL_ELEMENT_CARD)
            if not elements or index >= len(elements):
                print(f"[delete_element] ✗ Элемент с индексом {index} не найден (всего элементов: {len(elements) if elements else 0})")
                return False
            
            # Ищем кнопку удаления в карточке элемента
            element_card = elements[index]
            try:
                # Ищем кнопку удаления внутри карточки (TouchableOpacity с иконкой trash)
                # Кнопка находится справа в карточке
                delete_button = element_card.find_element(By.XPATH, ".//android.view.ViewGroup[last()]")
                delete_button.click()
                print(f"[delete_element] ✓ Кнопка удаления найдена и кликнута")
                time.sleep(1)  # Ждем появления диалога подтверждения
                
                # Подтверждаем удаление, если нужно
                if confirm:
                    self.confirm_delete()
                    print(f"[delete_element] ✓ Удаление подтверждено")
                    time.sleep(1)
                
                return True
            except Exception as e:
                print(f"[delete_element] ⚠ Не удалось найти кнопку удаления в карточке: {e}")
                # Fallback: ищем по иконке корзины
                try:
                    # Ищем все TouchableOpacity в карточке и кликаем на последний (обычно там кнопка удаления)
                    buttons = element_card.find_elements(By.XPATH, ".//android.view.ViewGroup[@clickable='true']")
                    if buttons:
                        buttons[-1].click()  # Кликаем на последнюю кнопку
                        print(f"[delete_element] ✓ Кликнули на последнюю кнопку в карточке")
                        time.sleep(1)
                        if confirm:
                            self.confirm_delete()
                        return True
                except Exception as e2:
                    print(f"[delete_element] ✗ Не удалось удалить элемент: {e2}")
                    return False
        except Exception as e:
            print(f"[delete_element] ✗ Ошибка при удалении элемента: {e}")
            return False
    
    def confirm_delete(self):
        """
        Подтверждает удаление в диалоге
        Ищет кнопку "Подтвердить" в модальном окне AlertDialog
        """
        print("[confirm_delete] Ищем кнопку подтверждения в диалоге...")
        try:
            # Сначала проверяем, что диалог виден (быстрая проверка)
            dialog_visible = False
            for locator in self.DELETE_CONFIRM_DIALOG:
                try:
                    # Быстрая проверка диалога (0.5s вместо 2s)
                    if self.is_displayed(locator, timeout=0.5):
                        dialog_visible = True
                        print("[confirm_delete] ✓ Диалог подтверждения найден")
                        break
                except:
                    continue
            
            if not dialog_visible:
                print("[confirm_delete] ⚠ Диалог подтверждения не найден, но продолжаем поиск кнопки...")
            
            # Детальный поиск кнопки "Подтвердить"
            print("[confirm_delete] Ищем все элементы с текстом 'Подтвердить'...")
            confirm_button = None
            confirm_button_found = False
            
            # Пробуем каждый локатор из списка (оптимизированные таймауты)
            for i, locator in enumerate(self.DELETE_CONFIRM_YES):
                try:
                    # Первые 2 локатора - быстрые проверки (0.5s), остальные - стандартные (1s)
                    timeout = 0.5 if i < 2 else 1.0
                    print(f"[confirm_delete] Попытка {i+1}/{len(self.DELETE_CONFIRM_YES)}: {self._format_locator(locator)} (timeout={timeout}s)")
                    element = self.find_element(locator, timeout=timeout)
                    
                    if element:
                        # Получаем информацию об элементе
                        try:
                            location = element.location
                            size = element.size
                            text = element.text
                            is_displayed = element.is_displayed()
                            is_enabled = element.is_enabled()
                            
                            print(f"[confirm_delete] ✓ Элемент найден:")
                            print(f"  - Текст: '{text}'")
                            print(f"  - Позиция: x={location['x']}, y={location['y']}")
                            print(f"  - Размер: width={size['width']}, height={size['height']}")
                            print(f"  - Центр: x={location['x'] + size['width']//2}, y={location['y'] + size['height']//2}")
                            print(f"  - Видим: {is_displayed}")
                            print(f"  - Включен: {is_enabled}")
                            
                            # Проверяем, что элемент действительно содержит текст "Подтвердить"
                            if 'Подтвердить' in text or 'Подтвердить' in (element.get_attribute('text') or ''):
                                confirm_button = element
                                confirm_button_found = True
                                print(f"[confirm_delete] ✓ Кнопка 'Подтвердить' найдена и валидна")
                                break
                            else:
                                print(f"[confirm_delete] ⚠ Элемент найден, но текст не совпадает: '{text}'")
                        except Exception as e:
                            print(f"[confirm_delete] ⚠ Не удалось получить информацию об элементе: {e}")
                            # Используем элемент, если он найден
                            confirm_button = element
                            confirm_button_found = True
                            break
                            
                except Exception as e:
                    print(f"[confirm_delete] ⚠ Локатор {i+1} не сработал: {e}")
                    continue
            
            if not confirm_button_found or not confirm_button:
                print("[confirm_delete] ✗ Кнопка 'Подтвердить' не найдена ни одним локатором")
                # Пробуем найти все элементы с текстом "Подтвердить"
                try:
                    all_confirm_buttons = self.driver.find_elements(By.XPATH, "//*[@text='Подтвердить' or contains(@text, 'Подтвердить')]")
                    print(f"[confirm_delete] Найдено {len(all_confirm_buttons)} элементов с текстом 'Подтвердить'")
                    for idx, btn in enumerate(all_confirm_buttons):
                        try:
                            location = btn.location
                            size = btn.size
                            text = btn.text
                            print(f"[confirm_delete] Элемент {idx+1}: '{text}' at ({location['x']}, {location['y']}), size={size['width']}x{size['height']}")
                        except:
                            pass
                except Exception as e:
                    print(f"[confirm_delete] ⚠ Не удалось найти все кнопки: {e}")
                raise Exception("Кнопка 'Подтвердить' не найдена")
            
            # Делаем скриншот перед кликом для отладки
            try:
                self.take_screenshot('before_confirm_click')
            except:
                pass
            
            # Кликаем на кнопку с детальным логированием
            print("[confirm_delete] Кликаем на кнопку 'Подтвердить'...")
            try:
                location = confirm_button.location
                size = confirm_button.size
                center_x = location['x'] + size['width'] // 2
                center_y = location['y'] + size['height'] // 2
                
                print(f"[confirm_delete] Координаты клика: x={center_x}, y={center_y}")
                print(f"[confirm_delete] Размер кнопки: {size['width']}x{size['height']}")
                print(f"[confirm_delete] Границы кнопки: x=[{location['x']}, {location['x'] + size['width']}], y=[{location['y']}, {location['y'] + size['height']}]")
                
                # Проверяем, что кнопка видима и кликабельна
                try:
                    is_displayed = confirm_button.is_displayed()
                    is_enabled = confirm_button.is_enabled()
                    print(f"[confirm_delete] Перед кликом: видим={is_displayed}, включен={is_enabled}")
                except Exception as e:
                    print(f"[confirm_delete] ⚠ Не удалось проверить состояние кнопки: {e}")
                
                # Пробуем кликнуть через координаты (более надежно для модальных окон)
                try:
                    print("[confirm_delete] Пробуем кликнуть через координаты (tap)...")
                    self.driver.tap([(center_x, center_y)])
                    print("[confirm_delete] ✓ Клик через координаты (tap) выполнен")
                    time.sleep(0.5)
                except Exception as e:
                    print(f"[confirm_delete] ⚠ Клик через tap не сработал: {e}")
                    # Пробуем через element.click()
                    try:
                        print("[confirm_delete] Пробуем element.click()...")
                        confirm_button.click()
                        print("[confirm_delete] ✓ Клик через element.click() выполнен")
                        time.sleep(0.5)
                    except Exception as e2:
                        print(f"[confirm_delete] ⚠ element.click() тоже не сработал: {e2}")
                        # Последняя попытка - через TouchAction
                        try:
                            from appium.webdriver.common.touch_action import TouchAction
                            print("[confirm_delete] Пробуем TouchAction...")
                            action = TouchAction(self.driver)
                            action.tap(confirm_button).perform()
                            print("[confirm_delete] ✓ Клик через TouchAction выполнен")
                            time.sleep(0.5)
                        except Exception as e3:
                            print(f"[confirm_delete] ✗ Все методы клика не сработали. Последняя ошибка: {e3}")
                            raise
                
                time.sleep(2)  # Ждем закрытия диалога и возврата на главный экран
                print("[confirm_delete] ✓ Кнопка 'Подтвердить' кликнута, ожидаем закрытия диалога...")
                
                # Проверяем, что диалог закрылся
                try:
                    time.sleep(0.5)
                    dialog_still_visible = False
                    for locator in self.DELETE_CONFIRM_DIALOG:
                        try:
                            if self.is_displayed_silent(locator, timeout=1):
                                dialog_still_visible = True
                                break
                        except:
                            continue
                    
                    if dialog_still_visible:
                        print("[confirm_delete] ⚠ Диалог все еще виден после клика!")
                    else:
                        print("[confirm_delete] ✓ Диалог закрыт")
                except:
                    pass
                    
            except Exception as e:
                print(f"[confirm_delete] ✗ Ошибка при клике на кнопку: {e}")
                # Делаем скриншот после ошибки
                try:
                    self.take_screenshot('confirm_click_error')
                except:
                    pass
                raise
                
        except Exception as e:
            print(f"[confirm_delete] ✗ Ошибка при подтверждении удаления: {e}")
            import traceback
            print(f"[confirm_delete] Traceback:\n{traceback.format_exc()}")
            raise
        
        return self
    
    def cancel_delete(self):
        """Отменяет удаление в диалоге"""
        self.click_multiple(self.DELETE_CONFIRM_NO)
        time.sleep(1)
        return self
    
    def delete_meal(self):
        """Полное удаление приема пищи (с подтверждением)"""
        self.click_delete()
        self.confirm_delete()
        return self
    
    # ==========================================================================
    # NAVIGATION METHODS
    # ==========================================================================
    
    def go_back(self):
        """
        Возвращается на предыдущий экран (MainScreen)
        """
        try:
            self.click_multiple(self.HEADER_BACK_BUTTON)
        except:
            # Fallback: системная кнопка назад
            self.driver.back()
        time.sleep(2)
        return self
    
    # ==========================================================================
    # SUMMARY METHODS
    # ==========================================================================
    
    def get_total_calories(self):
        """
        Получает общее количество калорий в приеме пищи
        
        Returns:
            float: Калории или 0
        """
        try:
            text = self.get_text(self.SUMMARY_TOTAL_CALORIES)
            numbers = re.findall(r'[\d.]+', text)
            return float(numbers[0]) if numbers else 0
        except:
            return 0
    
    def get_nutrition_summary(self):
        """
        Получает полную сводку БЖУ
        
        Returns:
            dict: {'calories': float, 'proteins': float, 'fats': float, 'carbs': float}
        """
        return {
            'calories': self.get_total_calories(),
            'proteins': self._extract_number(self.SUMMARY_PROTEINS),
            'fats': self._extract_number(self.SUMMARY_FATS),
            'carbs': self._extract_number(self.SUMMARY_CARBS),
        }
    
    def _extract_number(self, locator):
        """Извлекает число из текста элемента"""
        try:
            text = self.get_text(locator)
            numbers = re.findall(r'[\d.]+', text)
            return float(numbers[0]) if numbers else 0
        except:
            return 0
