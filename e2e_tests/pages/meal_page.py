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
        # По testID (надежный метод) - формат: meal_element_delete_{elementId}
        (AppiumBy.ACCESSIBILITY_ID, "meal_element_delete_"),  # Частичное совпадение для поиска
        (By.XPATH, "//*[starts-with(@content-desc, 'meal_element_delete_')]"),  # По testID через content-desc
        # По accessibilityLabel - формат: "Удалить {productName}"
        (By.XPATH, "//*[starts-with(@content-desc, 'Удалить ')]"),  # По accessibilityLabel через content-desc
        # Fallback: ищем иконку корзины (trash) на карточке элемента
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[contains(@text, 'ккал')]]//*[contains(@content-desc, 'trash') or contains(@content-desc, 'delete')]"),
        # Fallback: ищем кнопку удаления в карточке элемента (обычно справа)
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
        # Диалог удаления элемента (блюда)
        (By.XPATH, "//*[contains(@text, 'Удаление блюда')]"),
        # Диалог удаления приема пищи (legacy)
        (By.XPATH, "//*[contains(@text, 'Удаление приема пищи')]"),
        # Общий поиск по слову "Удаление"
        (By.XPATH, "//*[contains(@text, 'Удаление')]"),
        # Fallback: любой диалог с текстом "Удалить"
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
    
    def delete_element(self, index=0, confirm=True, debug=False):
        """
        Удаляет элемент приема пищи (блюдо) по индексу
        Кликает на красную иконку корзины на карточке элемента
        
        Args:
            index: Индекс элемента (0-based)
            confirm: Подтвердить ли удаление в диалоге (по умолчанию True)
            debug: Если True, выводит детальную диагностическую информацию
        
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
            
            element_card = elements[index]
            card_location = element_card.location
            card_size = element_card.size
            
            if debug:
                print(f"[delete_element] Границы карточки: x=[{card_location['x']}, {card_location['x'] + card_size['width']}], y=[{card_location['y']}, {card_location['y'] + card_size['height']}]")
            
            delete_button = None
            
            # Стратегия 1: Поиск по testID (meal_element_delete_{elementId})
            # Это самый надежный метод, так как testID уникален для каждого элемента
            try:
                if debug:
                    print(f"[delete_element] Стратегия 1: Поиск по testID...")
                
                # Ищем все кнопки удаления с testID
                all_delete_buttons = self.driver.find_elements(
                    By.XPATH, 
                    "//*[starts-with(@content-desc, 'meal_element_delete_')]"
                )
                
                if debug:
                    print(f"[delete_element] Найдено кнопок удаления по testID: {len(all_delete_buttons)}")
                
                # Фильтруем по позиции относительно карточки
                for btn in all_delete_buttons:
                    try:
                        btn_location = btn.location
                        btn_size = btn.size
                        btn_x = btn_location['x']
                        btn_y = btn_location['y']
                        
                        # Проверяем, что кнопка находится в пределах карточки
                        is_inside_y = card_location['y'] <= btn_y <= card_location['y'] + card_size['height']
                        is_right = btn_x > card_location['x'] + card_size['width'] * 0.7
                        is_small = btn_size['width'] < 150 and btn_size['height'] < 150
                        
                        if self._is_displayed(btn) and is_small and is_inside_y and is_right:
                            delete_button = btn
                            if debug:
                                print(f"[delete_element] ✓ Найдена кнопка по testID: позиция=({btn_x}, {btn_y}), размер={btn_size['width']}x{btn_size['height']}")
                            break
                    except Exception as e:
                        if debug:
                            print(f"[delete_element] ⚠ Ошибка при проверке кнопки: {e}")
                        continue
            except Exception as e:
                if debug:
                    print(f"[delete_element] ⚠ Стратегия 1 не сработала: {e}")
            
            # Стратегия 2: Поиск по accessibilityLabel (Удалить {productName})
            if not delete_button:
                try:
                    if debug:
                        print(f"[delete_element] Стратегия 2: Поиск по accessibilityLabel...")
                    
                    all_delete_buttons = self.driver.find_elements(
                        By.XPATH, 
                        "//*[starts-with(@content-desc, 'Удалить ')]"
                    )
                    
                    if debug:
                        print(f"[delete_element] Найдено элементов по accessibilityLabel: {len(all_delete_buttons)}")
                    
                    # Фильтруем по позиции
                    for btn in all_delete_buttons:
                        try:
                            btn_location = btn.location
                            btn_size = btn.size
                            btn_x = btn_location['x']
                            btn_y = btn_location['y']
                            
                            is_inside_y = (card_location['y'] <= btn_y <= card_location['y'] + card_size['height'] + 100)
                            is_right = btn_x > card_location['x'] + card_size['width'] * 0.7
                            is_small = btn_size['width'] < 150 and btn_size['height'] < 150
                            
                            if self._is_displayed(btn) and is_small and is_inside_y and is_right:
                                delete_button = btn
                                if debug:
                                    print(f"[delete_element] ✓ Найдена кнопка по accessibilityLabel: позиция=({btn_x}, {btn_y})")
                                break
                        except Exception as e:
                            if debug:
                                print(f"[delete_element] ⚠ Ошибка при проверке элемента: {e}")
                            continue
                except Exception as e:
                    if debug:
                        print(f"[delete_element] ⚠ Стратегия 2 не сработала: {e}")
            
            # Стратегия 3: Fallback - клик по координатам (правый верхний угол карточки)
            if not delete_button:
                try:
                    if debug:
                        print(f"[delete_element] Стратегия 3: Fallback - клик по координатам...")
                    
                    click_x = card_location['x'] + card_size['width'] - 40
                    click_y = card_location['y'] + 40
                    print(f"[delete_element] Кликаем по координатам: ({click_x}, {click_y})")
                    self.driver.tap([(click_x, click_y)])
                    time.sleep(1)
                    
                    if confirm:
                        self.confirm_delete()
                    return True
                except Exception as e:
                    print(f"[delete_element] ⚠ Стратегия 3 не сработала: {e}")
            
            # Если нашли кнопку, кликаем по ней
            if delete_button:
                try:
                    location = delete_button.location
                    size = delete_button.size
                    center_x = location['x'] + size['width'] // 2
                    center_y = location['y'] + size['height'] // 2
                    
                    print(f"[delete_element] Кликаем по центру кнопки: ({center_x}, {center_y})")
                    self.driver.tap([(center_x, center_y)])
                    time.sleep(1)
                    
                    if confirm:
                        self.confirm_delete()
                    
                    return True
                except Exception as e:
                    print(f"[delete_element] ⚠ Ошибка при клике на кнопку: {e}")
                    # Fallback на координаты
                    try:
                        click_x = card_location['x'] + card_size['width'] - 40
                        click_y = card_location['y'] + 40
                        self.driver.tap([(click_x, click_y)])
                        time.sleep(1)
                        if confirm:
                            self.confirm_delete()
                        return True
                    except Exception as e2:
                        print(f"[delete_element] ✗ Не удалось кликнуть по координатам: {e2}")
            
            print(f"[delete_element] ✗ Не удалось найти кнопку удаления")
            return False
            
        except Exception as e:
            print(f"[delete_element] ✗ Ошибка при удалении элемента: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _is_displayed(self, element):
        """Проверяет, видим ли элемент (обрабатывает разные типы is_displayed)"""
        try:
            is_displayed = element.is_displayed
            if callable(is_displayed):
                return is_displayed()
            return bool(is_displayed)
        except:
            return True  # Предполагаем видимым, если не можем проверить
    
    def confirm_delete(self):
        """
        Подтверждает удаление в диалоге
        Ищет кнопку "Подтвердить" в модальном окне AlertDialog
        """
        print("[confirm_delete] Ищем кнопку подтверждения в диалоге...")
        try:
            # Сначала проверяем, что диалог виден (увеличиваем таймаут для надежности)
            dialog_visible = False
            dialog_text = None
            for locator in self.DELETE_CONFIRM_DIALOG:
                try:
                    # Увеличиваем таймаут до 3 секунд для поиска диалога
                    element = self.find_element_silent(locator, timeout=3)
                    if element:
                        dialog_visible = True
                        try:
                            dialog_text = element.text or element.get_attribute('text') or ''
                        except:
                            pass
                        print(f"[confirm_delete] ✓ Диалог подтверждения найден: '{dialog_text}'")
                        break
                except:
                    continue
            
            if not dialog_visible:
                print("[confirm_delete] ⚠ Диалог подтверждения не найден, делаем скриншот и пробуем найти кнопку...")
                self.take_screenshot('dialog_not_found')
                # Пробуем найти любые модальные окна или диалоги
                try:
                    modals = self.driver.find_elements(By.XPATH, "//android.widget.Modal")
                    print(f"[confirm_delete] Найдено модальных окон: {len(modals)}")
                    for i, modal in enumerate(modals):
                        try:
                            modal_text = modal.text or modal.get_attribute('text') or ''
                            print(f"[confirm_delete] Модальное окно {i+1}: '{modal_text[:100]}'")
                        except:
                            pass
                except:
                    pass
            
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
    
    # ==========================================================================
    # COMMENT LOCATORS - для работы с комментариями (Story 3.5)
    # ==========================================================================
    
    # Секция комментария
    COMMENT_SECTION = [
        (By.XPATH, "//*[contains(@text, 'комментарий') or contains(@text, 'Нажмите, чтобы добавить')]"),
        (By.XPATH, "//android.view.ViewGroup[.//*[contains(@text, 'комментарий')]]"),
    ]
    
    # Текст комментария (когда он уже добавлен)
    COMMENT_TEXT = [
        (By.XPATH, "//*[contains(@text, 'комментарий')]/following-sibling::*[1]"),
        (By.XPATH, "//android.widget.TextView[contains(@text, '')]"),  # Fallback - любой текст в секции комментария
    ]
    
    # Плейсхолдер "Нажмите, чтобы добавить комментарий"
    COMMENT_PLACEHOLDER = [
        (By.XPATH, "//*[@text='Нажмите, чтобы добавить комментарий']"),
        (By.XPATH, "//*[contains(@text, 'добавить комментарий')]"),
    ]
    
    # Поле ввода комментария (TextInput)
    COMMENT_INPUT = [
        (By.XPATH, "//android.widget.EditText[contains(@hint, 'комментарий') or contains(@hint, 'Добавьте')]"),
        (By.XPATH, "//android.widget.EditText[@multiline='true']"),
        (By.XPATH, "//android.widget.EditText"),
    ]
    
    # Счетчик символов (например, "500/1000")
    COMMENT_CHAR_COUNT = [
        (By.XPATH, "//*[contains(@text, '/1000')]"),
        (By.XPATH, "//*[re:match(@text, '\\d+/1000')]"),
    ]
    
    # Кнопка "Сохранить" комментарий
    COMMENT_SAVE_BUTTON = [
        (By.XPATH, "//*[@text='Сохранить']"),
        (By.XPATH, "//*[contains(@text, 'Сохранить')]"),
    ]
    
    # Кнопка "Отмена" комментария
    COMMENT_CANCEL_BUTTON = [
        (By.XPATH, "//*[@text='Отмена']"),
        (By.XPATH, "//*[contains(@text, 'Отмена')]"),
    ]
    
    # ==========================================================================
    # COMMENT METHODS
    # ==========================================================================
    
    def click_comment_section(self, timeout: int = 5) -> bool:
        """
        Кликает по секции комментария для начала редактирования
        
        Returns:
            bool: True если клик выполнен успешно
        """
        print("[click_comment_section] Ищем секцию комментария...")
        try:
            # Сначала пробуем найти плейсхолдер или существующий комментарий
            for locator in self.COMMENT_PLACEHOLDER + self.COMMENT_TEXT + self.COMMENT_SECTION:
                try:
                    element = self.find_element(locator, timeout=2)
                    if element:
                        print(f"[click_comment_section] Найден элемент: {locator}")
                        self.tap_element(element)
                        time.sleep(1)
                        return True
                except:
                    continue
            
            print("[click_comment_section] ⚠ Секция комментария не найдена, пробуем найти по координатам...")
            # Fallback: ищем любую кликабельную область внизу summary
            return False
        except Exception as e:
            print(f"[click_comment_section] ✗ Ошибка: {e}")
            return False
    
    def enter_comment(self, comment_text: str, timeout: int = 10) -> bool:
        """
        Вводит текст комментария в поле ввода
        
        Args:
            comment_text: Текст комментария для ввода
            timeout: Таймаут поиска поля ввода
            
        Returns:
            bool: True если комментарий введен успешно
        """
        print(f"[enter_comment] Вводим комментарий: '{comment_text[:50]}...'")
        try:
            # Ищем поле ввода
            input_element = None
            for locator in self.COMMENT_INPUT:
                try:
                    input_element = self.find_element(locator, timeout=2)
                    if input_element:
                        print(f"[enter_comment] Найдено поле ввода: {locator}")
                        break
                except:
                    continue
            
            if not input_element:
                print("[enter_comment] ✗ Поле ввода комментария не найдено")
                return False
            
            # Очищаем поле и вводим текст
            input_element.clear()
            time.sleep(0.5)
            input_element.send_keys(comment_text)
            time.sleep(1)
            
            # Проверяем что текст введен
            entered_text = input_element.text
            if comment_text in entered_text or entered_text == comment_text:
                print(f"[enter_comment] ✓ Комментарий введен: '{entered_text[:50]}...'")
                return True
            else:
                print(f"[enter_comment] ⚠ Текст не совпадает. Ожидалось: '{comment_text[:50]}', получено: '{entered_text[:50]}'")
                return False
                
        except Exception as e:
            print(f"[enter_comment] ✗ Ошибка: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def get_comment_char_count(self) -> tuple:
        """
        Получает текущий счетчик символов комментария
        
        Returns:
            tuple: (current, max) например (150, 1000) или (None, None) если не найдено
        """
        try:
            for locator in self.COMMENT_CHAR_COUNT:
                try:
                    element = self.find_element(locator, timeout=2)
                    if element:
                        text = element.text
                        # Парсим формат "150/1000"
                        match = re.match(r'(\d+)/(\d+)', text)
                        if match:
                            current = int(match.group(1))
                            max_count = int(match.group(2))
                            return (current, max_count)
                except:
                    continue
            return (None, None)
        except:
            return (None, None)
    
    def save_comment(self, timeout: int = 5) -> bool:
        """
        Сохраняет комментарий (кликает кнопку "Сохранить")
        
        Returns:
            bool: True если комментарий сохранен успешно
        """
        print("[save_comment] Ищем кнопку 'Сохранить'...")
        try:
            for locator in self.COMMENT_SAVE_BUTTON:
                try:
                    element = self.find_element(locator, timeout=2)
                    if element:
                        print(f"[save_comment] Найдена кнопка: {locator}")
                        self.tap_element(element)
                        time.sleep(2)  # Ждем сохранения
                        print("[save_comment] ✓ Комментарий сохранен")
                        return True
                except:
                    continue
            
            print("[save_comment] ✗ Кнопка 'Сохранить' не найдена")
            return False
        except Exception as e:
            print(f"[save_comment] ✗ Ошибка: {e}")
            return False
    
    def cancel_comment_edit(self, timeout: int = 5) -> bool:
        """
        Отменяет редактирование комментария (кликает кнопку "Отмена")
        
        Returns:
            bool: True если редактирование отменено
        """
        print("[cancel_comment_edit] Ищем кнопку 'Отмена'...")
        try:
            for locator in self.COMMENT_CANCEL_BUTTON:
                try:
                    element = self.find_element(locator, timeout=2)
                    if element:
                        self.tap_element(element)
                        time.sleep(1)
                        print("[cancel_comment_edit] ✓ Редактирование отменено")
                        return True
                except:
                    continue
            return False
        except:
            return False
    
    def get_comment_text(self) -> str:
        """
        Получает текст текущего комментария (если он есть)
        
        Returns:
            str: Текст комментария или пустая строка
        """
        try:
            # Ищем текст комментария (не плейсхолдер)
            for locator in self.COMMENT_TEXT:
                try:
                    element = self.find_element(locator, timeout=2)
                    if element:
                        text = element.text
                        # Проверяем что это не плейсхолдер
                        if 'добавить комментарий' not in text.lower():
                            return text
                except:
                    continue
            return ""
        except:
            return ""
    
    def is_comment_editing(self) -> bool:
        """
        Проверяет, находится ли комментарий в режиме редактирования
        
        Returns:
            bool: True если комментарий в режиме редактирования
        """
        try:
            # Если есть поле ввода и кнопки Сохранить/Отмена - значит редактирование активно
            input_found = False
            for locator in self.COMMENT_INPUT:
                try:
                    element = self.find_element(locator, timeout=1)
                    if element:
                        input_found = True
                        break
                except:
                    continue
            
            if not input_found:
                return False
            
            # Проверяем наличие кнопок
            save_found = False
            for locator in self.COMMENT_SAVE_BUTTON:
                try:
                    element = self.find_element(locator, timeout=1)
                    if element:
                        save_found = True
                        break
                except:
                    continue
            
            return save_found
        except:
            return False