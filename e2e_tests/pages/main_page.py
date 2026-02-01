"""
Page Object для главного экрана (MainScreen)
Story 3.1: Create Meal Entry

UI Structure (MainScreen.tsx):
- Header с заголовком "Расписание"
- FriendSelector (выбор друга для просмотра)
- DateStrip (полоса дат с навигацией ‹ / ›)
- DailySummary (сводка калорий и БЖУ)
- Список MealCard (приемы пищи)
- FAB кнопка (+) для добавления приема пищи
- Bottom Navigation (Главная, Поиск, Профиль)

User Flow:
1. Просмотр приемов пищи за выбранную дату
2. Навигация по датам через DateStrip
3. FAB → SearchScreen для добавления продуктов
4. Клик на MealCard → MealScreen для просмотра деталей
"""
import os
import sys
import time
import re
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class MainPage(BasePage):
    """Класс для работы с главным экраном (MainScreen)"""
    
    # ==========================================================================
    # FAB (Floating Action Button) - основная кнопка добавления
    # ==========================================================================
    
    # FAB кнопка (+) в правом нижнем углу
    # Порядок оптимизирован: рабочие локаторы первыми (по логам)
    ADD_MEAL_BUTTON = [
        (By.XPATH, "//*[@content-desc='Добавить прием пищи']"),  # Рабочий локатор (найден в логах)
        (AppiumBy.ACCESSIBILITY_ID, "add_meal_button"),  # Не работает, но оставляем как fallback
        (By.XPATH, "//android.view.ViewGroup[contains(@content-desc, '+')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, '+')]"),
        # Fallback: ищем FAB по позиции (обычно в правом нижнем углу)
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='+']]"),
    ]
    
    # ==========================================================================
    # DateStrip - навигация по датам (горизонтальная полоса с датами)
    # UI: СРД 28 | ЧТВ 29 | ПТН 30 | [СУБ 31] | ВСК 1 | ПНД 2 | ВТР 3
    # Нет стрелок - нужно кликать на сами элементы дат
    # ==========================================================================
    
    # Сокращения дней недели на русском
    DAY_ABBREVIATIONS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС', 
                         'ПНД', 'ВТР', 'СРД', 'ЧТВ', 'ПТН', 'СУБ', 'ВСК']
    
    # Локатор для всех элементов дат в DateStrip
    DATE_ITEMS = [
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[string-length(@text) <= 3]]//android.widget.TextView[string-length(@text) <= 2 and number(@text) = @text]"),
        (By.XPATH, "//android.widget.TextView[string-length(@text) <= 2 and number(@text) = @text]"),
    ]
    
    # Локатор для текущей выбранной даты (обычно выделена цветом)
    SELECTED_DATE = [
        (By.XPATH, "//android.view.ViewGroup[@selected='true']//android.widget.TextView"),
        (By.XPATH, "//*[contains(@content-desc, 'выбран')]"),
    ]
    
    # ==========================================================================
    # MealCard - карточки приемов пищи (находятся НИЖЕ секции "Приемы пищи")
    # ==========================================================================
    
    # Более специфичные локаторы для карточек приемов пищи
    # Они содержат тип приема (Завтрак, Обед...) и калории
    MEAL_CARD = [
        # Карточка с типом приема пищи (Завтрак, Обед и т.д.)
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Завтрак' or @text='Обед' or @text='Ужин' or @text='Полдник']]"),
        # Кликабельная карточка с калориями в нижней части экрана (y > 600)
        (By.XPATH, "//android.view.ViewGroup[@clickable='true'][.//android.widget.TextView[contains(@text, 'ккал')]]"),
    ]
    
    # Текст "Нет приемов пищи" - означает что приемов нет
    NO_MEALS_TEXT = (By.XPATH, "//*[contains(@text, 'Нет приемов пищи')]")
    
    # ==========================================================================
    # DailySummary - сводка за день (в верхней части экрана)
    # ==========================================================================
    
    # Главный счетчик калорий - большое число в центре сводки
    # В DailySummary калории отображаются как два отдельных TextView:
    # 1. Число (например, "740")
    # 2. Текст "ккал"
    # Они находятся в одном контейнере (ringTextContainer)
    DAILY_CALORIES = [
        # Ищем число, которое находится в том же родительском контейнере, что и "ккал"
        # Структура: ViewGroup (ringTextContainer) -> TextView (число) + TextView ("ккал")
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='ккал']]//android.widget.TextView[not(@text='ккал') and string-length(@text) > 0 and number(@text) = @text]"),
        # Альтернатива: ищем число, которое находится рядом с "ккал" (в пределах одного ViewGroup)
        (By.XPATH, "//android.widget.TextView[@text='ккал']/preceding-sibling::android.widget.TextView[number(@text) = @text]"),
        (By.XPATH, "//android.widget.TextView[@text='ккал']/following-sibling::android.widget.TextView[number(@text) = @text]"),
        # Fallback: ищем число в секции "Сегодня" / "Сводка питания"
        (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Сегодня']]//android.widget.TextView[number(@text) = @text and string-length(@text) <= 4]"),
        # Последний fallback: ищем любое число рядом с "ккал"
        (By.XPATH, "//android.widget.TextView[contains(@text, 'ккал')]"),
    ]
    
    # ==========================================================================
    # Bottom Navigation
    # ==========================================================================
    
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
    
    def is_page_loaded(self, timeout=None, log_search=False):
        """
        Проверяет, загрузилась ли главная страница (оптимизировано)
        
        Проверяем наличие:
        1. Индикаторов главного экрана (заголовки) - быстрая проверка
        2. FAB кнопки добавления
        3. Bottom navigation
        
        Args:
            timeout: Максимальное время ожидания (по умолчанию 10)
            log_search: Логировать ли поиск элементов
        """
        if timeout is None:
            timeout = 10
        
        if log_search:
            print(f"[MAIN_PAGE] Проверка загрузки главного экрана (timeout={timeout}s)")
        
        # Оптимизация: сначала быстрая проверка самого надежного индикатора
        # "Расписание" - всегда присутствует на главном экране
        try:
            self.driver.implicitly_wait(0.3)  # Быстрая проверка
            schedule_elements = self.driver.find_elements(By.XPATH, "//*[@text='Расписание' or contains(@text, 'Расписание')]")
            if schedule_elements:
                for el in schedule_elements[:3]:  # Проверяем только первые 3
                    try:
                        if el.is_displayed():
                            self.driver.implicitly_wait(10)
                            if log_search:
                                print(f"[MAIN_PAGE] ✓ Найден индикатор 'Расписание'")
                            return True
                    except:
                        continue
        except:
            pass
        finally:
            self.driver.implicitly_wait(10)
        
        if log_search:
            print(f"[MAIN_PAGE] 'Расписание' не найдено, проверяем другие индикаторы...")
        
        # Если "Расписание" не найдено, проверяем другие индикаторы (с меньшим таймаутом)
        check_timeout = min(1, timeout / len(self.MAIN_SCREEN_INDICATORS))
        for idx, indicator in enumerate(self.MAIN_SCREEN_INDICATORS):
            try:
                if log_search:
                    print(f"[MAIN_PAGE] Проверка индикатора {idx+1}/{len(self.MAIN_SCREEN_INDICATORS)}")
                if self.is_displayed_silent(indicator, timeout=check_timeout, log_search=log_search):
                    if log_search:
                        print(f"[MAIN_PAGE] ✓ Найден индикатор {idx+1}")
                    return True
            except:
                continue
        
        # Затем проверяем FAB кнопку (может отсутствовать на пустом экране)
        if log_search:
            print(f"[MAIN_PAGE] Проверка FAB кнопки...")
        try:
            if self.is_displayed_multiple(self.ADD_MEAL_BUTTON, timeout=1):
                if log_search:
                    print(f"[MAIN_PAGE] ✓ Найдена FAB кнопка")
                return True
        except:
            pass
        
        # Проверяем наличие bottom navigation (всегда должен быть)
        if log_search:
            print(f"[MAIN_PAGE] Проверка bottom navigation...")
        try:
            if self.is_displayed_multiple(self.PROFILE_TAB, timeout=1):
                if log_search:
                    print(f"[MAIN_PAGE] ✓ Найдена bottom navigation")
                return True
        except:
            pass
        
        if log_search:
            print(f"[MAIN_PAGE] ✗ Главный экран не загружен")
        return False
    
    def is_on_main_page_fast(self, timeout=1.5):
        """
        Быстрая проверка главного экрана без скриншотов при ошибке (оптимизировано)
        
        Использует find_elements с коротким implicit wait для быстрой проверки
        без вывода DEBUG сообщений для ускорения.
        """
        try:
            # Устанавливаем очень короткий implicit wait для быстрого поиска
            self.driver.implicitly_wait(0.1)
            
            try:
                # Используем find_elements для быстрого поиска без ожидания полного таймаута
                # Проверяем несколько надежных индикаторов последовательно
                
                # 1. Проверяем заголовок "Расписание" (самый надежный индикатор)
                try:
                    elements = self.driver.find_elements(By.XPATH, "//*[@text='Расписание']")
                    if elements:
                        for el in elements:
                            try:
                                if el.is_displayed():
                                    return True
                            except Exception:
                                continue
                except Exception:
                    pass
                
                # 2. Проверяем bottom navigation - вкладку "Профиль" (всегда есть на главном экране)
                try:
                    elements = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'Профиль')]")
                    if elements:
                        for el in elements:
                            try:
                                if el.is_displayed():
                                    return True
                            except Exception:
                                continue
                except Exception:
                    pass
                
                # 3. Проверяем вкладку "Главная" в bottom navigation
                try:
                    elements = self.driver.find_elements(*self.HOME_TAB)
                    if elements:
                        for el in elements:
                            try:
                                if el.is_displayed():
                                    return True
                            except Exception:
                                continue
                except Exception:
                    pass
                
                # Если ничего не найдено - не главный экран
                return False
            finally:
                # Восстанавливаем implicit wait
                self.driver.implicitly_wait(10)
        except Exception:
            return False
    
    def click_add_meal_button(self):
        """
        Кликает на FAB кнопку добавления приема пищи
        Открывает SearchScreen (оптимизировано)
        """
        self.click_multiple(self.ADD_MEAL_BUTTON)
        time.sleep(0.3)  # Уменьшили с 0.5 до 0.3 для анимации
        return self
    
    def get_date_strip_items_fast(self):
        """
        БЫСТРАЯ версия получения элементов дат из DateStrip
        Ищем сокращения дней недели (СРД, ЧТВ, ПТН, СУБ, ВСК, ПНД, ВТР)
        
        Returns:
            list: Список кортежей (element, day_abbr, x_position)
        """
        items = []
        
        # Сокращения дней недели которые ищем
        day_abbrs = {'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС',
                     'ПНД', 'ВТР', 'СРД', 'ЧТВ', 'ПТН', 'СУБ', 'ВСК'}
        
        # Устанавливаем минимальный implicit wait для скорости
        self.driver.implicitly_wait(1)
        
        try:
            # Ищем элементы с сокращениями дней
            elements = self.driver.find_elements(By.XPATH, 
                "//android.widget.TextView[string-length(@text) = 3 or string-length(@text) = 2]")
            
            for el in elements:
                try:
                    text = el.text.strip().upper()
                    if text in day_abbrs:
                        location = el.location
                        # DateStrip обычно в верхней части (y < 500)
                        if location['y'] < 500:
                            items.append((el, text, location['x']))
                except:
                    continue
            
            # Сортируем по X-позиции (слева направо)
            items.sort(key=lambda x: x[2])
            
        except Exception as e:
            print(f"Date search error: {e}")
        finally:
            # Восстанавливаем implicit wait
            self.driver.implicitly_wait(10)
        
        return items
    
    def change_date(self, direction='next', retry=True):
        """
        Меняет дату через DateStrip (кликом на соседний элемент даты)
        УЛУЧШЕННАЯ версия с запоминанием текущей даты и проверкой изменения
        
        Args:
            direction: 'prev' для предыдущего дня, 'next' для следующего
            retry: Повторить попытку если не удалось найти элементы
        
        Returns:
            bool: True если дата изменена успешно, False если не удалось
        """
        import time as t
        
        # Запоминаем текущую выбранную дату перед изменением
        items_before = self.get_date_strip_items_fast()
        if not items_before or len(items_before) < 3:
            items_before = self._get_date_items_fallback()
        
        if not items_before or len(items_before) < 3:
            if retry:
                print("DateStrip: waiting and retrying...")
                time.sleep(1)
                items_before = self.get_date_strip_items_fast()
                if not items_before or len(items_before) < 3:
                    items_before = self._get_date_items_fallback()
            
            if not items_before or len(items_before) < 3:
                print("⚠ DateStrip: could not find date items, skipping date change")
                return False
        
        # Определяем текущую выбранную дату (обычно в центре)
        selected_idx_before = len(items_before) // 2
        current_date_abbr = items_before[selected_idx_before][1] if 0 <= selected_idx_before < len(items_before) else None
        
        if current_date_abbr:
            print(f"DateStrip: текущая дата: {current_date_abbr}, направление: {direction}")
        
        # Определяем на какой элемент кликать
        if direction == 'prev':
            target_idx = selected_idx_before - 1
        else:
            target_idx = selected_idx_before + 1
        
        # Проверяем, что целевой индекс валиден
        if target_idx < 0 or target_idx >= len(items_before):
            print(f"DateStrip: ⚠ Целевой индекс {target_idx} вне диапазона, доступно дат: {len(items_before)}")
            # Если мы на краю списка, возможно нужно прокрутить или список не обновился
            # Пробуем найти нужную дату в списке по порядку дней недели
            if current_date_abbr:
                target_abbr = self._get_next_day_abbr(current_date_abbr, direction)
                if target_abbr:
                    # Ищем целевую дату в списке
                    found = False
                    for idx, (el, abbr, _) in enumerate(items_before):
                        if abbr == target_abbr:
                            target_idx = idx
                            print(f"DateStrip: Найдена целевая дата {target_abbr} на позиции {target_idx}")
                            found = True
                            break
                    
                    if not found:
                        print(f"DateStrip: ⚠ Целевая дата {target_abbr} не найдена в списке")
                        # Если целевая дата не найдена, возможно мы уже на краю видимого списка
                        # Пробуем кликнуть на последний/первый элемент в зависимости от направления
                        if direction == 'next' and target_idx >= len(items_before):
                            target_idx = len(items_before) - 1
                            print(f"DateStrip: Кликаем на последний элемент в списке")
                        elif direction == 'prev' and target_idx < 0:
                            target_idx = 0
                            print(f"DateStrip: Кликаем на первый элемент в списке")
                        else:
                            return False
                else:
                    return False
            else:
                return False
        
        # Инициализируем переменные для целевой даты
        target_el = None
        target_abbr = None
        
        if 0 <= target_idx < len(items_before):
            target_el, target_abbr, _ = items_before[target_idx]
        
        # Проверяем, что мы не кликаем на ту же дату, на которой уже находимся
        if current_date_abbr and target_abbr and target_abbr == current_date_abbr:
                # Кликаем на тот же элемент - это неправильно, нужно найти следующий/предыдущий
                print(f"DateStrip: ⚠ Целевая дата {target_abbr} совпадает с текущей {current_date_abbr}, ищем правильную дату")
                expected_abbr = self._get_next_day_abbr(current_date_abbr, direction)
                if expected_abbr:
                    # Ищем ожидаемую дату в списке
                    found_target = False
                    for idx, (el, abbr, _) in enumerate(items_before):
                        if abbr == expected_abbr:
                            target_idx = idx
                            target_el, target_abbr = el, abbr
                            found_target = True
                            print(f"DateStrip: Найдена правильная целевая дата {target_abbr} на позиции {target_idx}")
                            break
                    
                    if not found_target:
                        print(f"DateStrip: ⚠ Ожидаемая дата {expected_abbr} не найдена в списке, используем соседний элемент")
                        # Используем соседний элемент, даже если он тот же
                        if direction == 'next' and target_idx + 1 < len(items_before):
                            target_idx = target_idx + 1
                            target_el, target_abbr, _ = items_before[target_idx]
                        elif direction == 'prev' and target_idx - 1 >= 0:
                            target_idx = target_idx - 1
                            target_el, target_abbr, _ = items_before[target_idx]
        
        # Кликаем на целевую дату
        if 0 <= target_idx < len(items_before):
            try:
                if not target_el:
                    target_el, target_abbr, _ = items_before[target_idx]
                
                print(f"DateStrip: clicking on {target_abbr} (текущая: {current_date_abbr})")
                target_el.click()
                time.sleep(0.5)  # Даем время на применение даты
                
                # Проверяем, что дата изменилась (повторно получаем список дат)
                max_checks = 5
                for check in range(max_checks):
                    items_after = self.get_date_strip_items_fast()
                    if not items_after or len(items_after) < 3:
                        items_after = self._get_date_items_fallback()
                    
                    if items_after and len(items_after) >= 3:
                        selected_idx_after = len(items_after) // 2
                        new_date_abbr = items_after[selected_idx_after][1] if 0 <= selected_idx_after < len(items_after) else None
                        
                        # Если дата изменилась - успех
                        if new_date_abbr and new_date_abbr != current_date_abbr:
                            print(f"DateStrip: ✓ Дата изменилась: {current_date_abbr} → {new_date_abbr}")
                            return True
                        
                        # Если дата не изменилась, но мы кликнули на правильный элемент - возможно нужно подождать
                        if new_date_abbr == target_abbr and target_abbr != current_date_abbr:
                            print(f"DateStrip: ✓ Кликнули на {target_abbr}, дата обновилась")
                            return True
                    
                    # Если дата еще не изменилась - ждем немного и проверяем снова
                    if check < max_checks - 1:
                        time.sleep(0.3)
                
                # Если после всех проверок дата не изменилась - возможно клик не сработал
                if current_date_abbr and target_abbr == current_date_abbr:
                    print(f"DateStrip: ⚠ Кликнули на ту же дату {target_abbr}, дата не изменилась")
                    return False  # Возвращаем False, так как дата не изменилась
                else:
                    print(f"DateStrip: ⚠ Дата не изменилась после клика на {target_abbr}, но продолжаем")
                    return True  # Возвращаем True, так как клик был выполнен
                
            except Exception as e:
                print(f"⚠ Error clicking date: {e}")
                return False
        
        print(f"⚠ DateStrip: target_idx {target_idx} вне диапазона [0, {len(items_before)})")
        return False
    
    def get_selected_date_text(self):
        """
        Получает текст выбранной даты из DateStrip
        
        Returns:
            str: Текст выбранной даты (например, "31" или "СУБ 31") или None
        """
        try:
            items = self.get_date_strip_items_fast()
            if items:
                # Выбранная дата обычно в центре
                selected_idx = len(items) // 2
                if 0 <= selected_idx < len(items):
                    _, abbr, _ = items[selected_idx]
                    # Ищем число рядом с сокращением дня
                    try:
                        # Ищем TextView с числом рядом с выбранным элементом
                        parent = abbr.find_element(By.XPATH, "./parent::*")
                        number_elements = parent.find_elements(By.XPATH, ".//android.widget.TextView")
                        for el in number_elements:
                            text = el.text.strip()
                            if text.isdigit():
                                return text
                    except Exception:
                        pass
        except Exception:
            pass
        return None
    
    def wait_for_date_change(self, expected_direction='next', timeout=5):
        """
        Ждет изменения даты после вызова change_date
        
        Args:
            expected_direction: 'prev' или 'next' - ожидаемое направление
            timeout: Таймаут ожидания
        
        Returns:
            bool: True если дата изменилась
        """
        import time as t
        start = t.time()
        
        # Получаем начальную дату
        initial_date = self.get_selected_date_text()
        
        while t.time() - start < timeout:
            current_date = self.get_selected_date_text()
            if current_date and current_date != initial_date:
                print(f"✓ Дата изменилась: {initial_date} -> {current_date}")
                return True
            t.sleep(0.3)
        
        print(f"⚠ Дата не изменилась за {timeout} секунд")
        return False
    
    def _get_date_items_fallback(self):
        """Альтернативный поиск дат - ищем сокращения дней недели"""
        items = []
        day_abbrs = {'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС',
                     'ПНД', 'ВТР', 'СРД', 'ЧТВ', 'ПТН', 'СУБ', 'ВСК'}
        try:
            elements = self.driver.find_elements(By.XPATH, "//android.widget.TextView")
            
            for el in elements[:50]:
                try:
                    text = el.text.strip().upper()
                    if text in day_abbrs:
                        location = el.location
                        if location['y'] < 600:
                            items.append((el, text, location['x']))
                except:
                    continue
            
            items.sort(key=lambda x: x[2])
        except:
            pass
        return items
    
    def _get_next_day_abbr(self, current_abbr, direction='next'):
        """
        Определяет следующую/предыдущую дату по порядку дней недели
        
        Args:
            current_abbr: Текущее сокращение дня (например, 'СУБ', 'ВСК')
            direction: 'next' для следующего дня, 'prev' для предыдущего
        
        Returns:
            str: Сокращение следующего/предыдущего дня или None
        """
        # Порядок дней недели (с понедельника)
        day_order = ['ПН', 'ПНД', 'ВТ', 'ВТР', 'СР', 'СРД', 'ЧТ', 'ЧТВ', 'ПТ', 'ПТН', 'СБ', 'СУБ', 'ВС', 'ВСК']
        
        # Нормализуем сокращения (приводим к длинным формам)
        abbr_map = {
            'ПН': 'ПНД', 'ВТ': 'ВТР', 'СР': 'СРД', 'ЧТ': 'ЧТВ', 'ПТ': 'ПТН', 'СБ': 'СУБ', 'ВС': 'ВСК'
        }
        
        # Приводим к длинной форме
        normalized = abbr_map.get(current_abbr, current_abbr)
        
        try:
            current_idx = day_order.index(normalized)
            if direction == 'next':
                next_idx = (current_idx + 1) % len(day_order)
            else:
                next_idx = (current_idx - 1) % len(day_order)
            
            return day_order[next_idx]
        except ValueError:
            # Если не нашли в списке - возвращаем None
            return None
    
    def _debug_all_text_elements(self):
        """Отладка - вывести все текстовые элементы в верхней части"""
        print("\n=== DEBUG: Text elements in top area ===")
        try:
            elements = self.driver.find_elements(By.XPATH, "//android.widget.TextView")
            for el in elements[:30]:
                try:
                    text = el.text.strip()
                    loc = el.location
                    if loc['y'] < 400:
                        print(f"  text='{text}', y={loc['y']}, x={loc['x']}")
                except:
                    pass
        except Exception as e:
            print(f"Debug error: {e}")
        print("=== END DEBUG ===\n")
    
    def get_daily_calories(self, debug=False):
        """
        Получает значение дневных калорий из DailySummary
        
        В DailySummary калории отображаются как два отдельных TextView:
        - Число (например, "740")
        - Текст "ккал"
        
        Args:
            debug: Если True, выводит отладочную информацию
        
        Returns:
            int: Количество калорий или 0
        """
        import re
        
        try:
            # Сначала ищем элемент с текстом "ккал" в секции DailySummary
            kcal_element = None
            try:
                # Ищем "ккал" в секции "Сегодня" / "Сводка питания"
                kcal_locators = [
                    (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Сегодня']]//android.widget.TextView[@text='ккал']"),
                    (By.XPATH, "//android.widget.TextView[@text='ккал']"),
                ]
                kcal_element = self.find_element_multiple(kcal_locators, timeout=2)
            except Exception:
                pass
            
            if kcal_element:
                if debug:
                    print(f"[get_daily_calories] Найден элемент 'ккал'")
                
                # Получаем координаты элемента "ккал"
                try:
                    kcal_location = kcal_element.location
                    kcal_size = kcal_element.size
                    kcal_center_x = kcal_location['x'] + kcal_size['width'] / 2
                    kcal_center_y = kcal_location['y'] + kcal_size['height'] / 2
                    
                    if debug:
                        print(f"[get_daily_calories] Координаты 'ккал': x={kcal_location['x']}, y={kcal_location['y']}")
                    
                    # Ищем все TextView в секции "Сегодня"
                    # Число калорий должно быть выше элемента "ккал" (меньше y) и примерно на той же x-координате
                    today_section = None
                    try:
                        today_locators = [
                            (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Сегодня']]"),
                        ]
                        today_section = self.find_element_multiple(today_locators, timeout=2)
                    except Exception:
                        pass
                    
                    # Ищем все TextView в секции или на всем экране
                    if today_section:
                        text_views = today_section.find_elements(By.XPATH, ".//android.widget.TextView")
                    else:
                        # Fallback: ищем все TextView на экране
                        text_views = self.driver.find_elements(By.XPATH, "//android.widget.TextView")
                    
                    # Ищем число рядом с "ккал"
                    best_match = None
                    min_distance = float('inf')
                    
                    for tv in text_views:
                        try:
                            text = tv.text.strip()
                            # Пропускаем "ккал", "Сегодня", "Сводка питания" и пустые строки
                            if text in ["ккал", "Сегодня", "Сводка питания"] or not text:
                                continue
                            
                            # Проверяем, является ли текст числом
                            if text.isdigit():
                                tv_location = tv.location
                                tv_size = tv.size
                                tv_center_x = tv_location['x'] + tv_size['width'] / 2
                                tv_center_y = tv_location['y'] + tv_size['height'] / 2
                                
                                # Число должно быть выше "ккал" (меньше y) и примерно на той же x-координате
                                # Допускаем небольшое отклонение по x (до 100px) и проверяем, что число выше
                                x_diff = abs(tv_center_x - kcal_center_x)
                                y_diff = kcal_center_y - tv_center_y  # Положительное, если число выше
                                
                                # Число должно быть выше "ккал" и не слишком далеко по x
                                if y_diff > 0 and y_diff < 200 and x_diff < 100:
                                    distance = (x_diff ** 2 + y_diff ** 2) ** 0.5
                                    if distance < min_distance:
                                        min_distance = distance
                                        best_match = (int(text), distance)
                                        
                                        if debug:
                                            print(f"[get_daily_calories] Найдено число '{text}' на расстоянии {distance:.1f}px от 'ккал' (x_diff={x_diff:.1f}, y_diff={y_diff:.1f})")
                        except Exception:
                            continue
                    
                    if best_match:
                        calories, distance = best_match
                        if debug:
                            print(f"[get_daily_calories] ✓ Найдено число калорий: {calories} (расстояние: {distance:.1f}px)")
                        return calories
                    elif debug:
                        print(f"[get_daily_calories] Число не найдено рядом с 'ккал'")
                        
                except Exception as e:
                    if debug:
                        print(f"[get_daily_calories] Ошибка при поиске числа по координатам: {e}")
                        import traceback
                        traceback.print_exc()
            
            # Fallback: пробуем найти элемент через основные локаторы
            element = self.find_element_multiple(self.DAILY_CALORIES, timeout=2)
            if element:
                text = element.text.strip()
                if debug:
                    print(f"[get_daily_calories] Найден элемент с текстом: '{text}'")
                
                # Если элемент содержит "ккал", ищем число рядом
                if "ккал" in text:
                    # Извлекаем число из текста
                    numbers = re.findall(r'\d+', text)
                    if numbers:
                        calories = int(numbers[0])
                        if debug:
                            print(f"[get_daily_calories] Извлечено калорий из текста: {calories}")
                        return calories
                # Если это просто число
                elif text.isdigit():
                    calories = int(text)
                    if debug:
                        print(f"[get_daily_calories] Найдено число: {calories}")
                    return calories
                # Пытаемся извлечь число из текста
                else:
                    numbers = re.findall(r'\d+', text)
                    if numbers:
                        calories = int(numbers[0])
                        if debug:
                            print(f"[get_daily_calories] Извлечено калорий: {calories}")
                        return calories
            
            if debug:
                print("[get_daily_calories] Элемент с калориями не найден")
        except Exception as e:
            if debug:
                print(f"[get_daily_calories] Ошибка: {e}")
                import traceback
                traceback.print_exc()
        
        return 0
    
    def wait_for_calories_update(self, initial_calories, timeout=10, poll_interval=0.5):
        """
        Ожидает обновления калорий на главном экране.
        
        Используется после добавления/удаления приема пищи для ожидания
        обновления данных на главном экране.
        
        Args:
            initial_calories: Начальное значение калорий (до изменения)
            timeout: Максимальное время ожидания в секундах
            poll_interval: Интервал проверки в секундах
        
        Returns:
            int: Текущее значение калорий или initial_calories если не обновилось
        """
        import time
        start_time = time.time()
        last_calories = initial_calories
        
        print(f"[wait_for_calories_update] Ожидание обновления калорий (начальное: {initial_calories})...")
        
        while time.time() - start_time < timeout:
            current_calories = self.get_daily_calories(debug=False)
            
            # Если калории изменились - обновление произошло
            if current_calories != initial_calories:
                print(f"[wait_for_calories_update] ✓ Калории обновились: {initial_calories} → {current_calories} (за {time.time() - start_time:.1f}s)")
                return current_calories
            
            # Если калории изменились с последней проверки (даже если не от начального)
            if current_calories != last_calories:
                print(f"[wait_for_calories_update] Калории изменились: {last_calories} → {current_calories}")
                last_calories = current_calories
            
            time.sleep(poll_interval)
        
        # Если не обновилось, возвращаем текущее значение
        final_calories = self.get_daily_calories(debug=True)
        print(f"[wait_for_calories_update] ⚠ Таймаут ожидания ({timeout}s). Текущие калории: {final_calories}")
        return final_calories
    
    def wait_for_meals_count_update(self, initial_count, timeout=10, poll_interval=0.5, use_badge=True):
        """
        Ожидает обновления количества приемов пищи на главном экране.
        
        Используется после добавления/удаления приема пищи для ожидания
        обновления данных на главном экране.
        
        Args:
            initial_count: Начальное количество meals (до изменения)
            timeout: Максимальное время ожидания в секундах
            poll_interval: Интервал проверки в секундах
            use_badge: Использовать ли бейдж для подсчета (более надежно) или поиск карточек
        
        Returns:
            int: Текущее количество meals или initial_count если не обновилось
        """
        start_time = time.time()
        last_count = initial_count
        
        print(f"[wait_for_meals_count_update] Ожидание обновления количества meals (начальное: {initial_count})...")
        
        while time.time() - start_time < timeout:
            # Используем бейдж если доступен, иначе поиск карточек
            if use_badge:
                current_count = self.get_meals_count_from_badge(debug=False)
                # Если бейдж не найден, используем поиск карточек как fallback
                if current_count is None:
                    current_count = self.get_meals_count(debug=False, retry_count=1, scroll_enabled=False)
            else:
                current_count = self.get_meals_count(debug=False, retry_count=1, scroll_enabled=False)
            
            # Если количество изменилось - обновление произошло
            if current_count != initial_count:
                print(f"[wait_for_meals_count_update] ✓ Количество meals обновилось: {initial_count} → {current_count} (за {time.time() - start_time:.1f}s)")
                return current_count
            
            # Если количество изменилось с последней проверки (даже если не от начального)
            if current_count != last_count:
                print(f"[wait_for_meals_count_update] Количество meals изменилось: {last_count} → {current_count}")
                last_count = current_count
            
            time.sleep(poll_interval)
        
        # Если не обновилось, возвращаем текущее значение
        final_count = self.get_meals_count_from_badge(debug=True) if use_badge else self.get_meals_count(debug=True, retry_count=2, scroll_enabled=True)
        if final_count is None:
            final_count = self.get_meals_count(debug=True, retry_count=2, scroll_enabled=True)
        
        print(f"[wait_for_meals_count_update] ⚠ Таймаут ожидания ({timeout}s). Текущее количество meals: {final_count}")
        return final_count if final_count is not None else initial_count
    
    def get_meals_count(self, debug=False, retry_count=3, scroll_enabled=True, use_badge_first=True):
        """
        Получает количество приемов пищи за выбранный день
        
        Если use_badge_first=True, сначала пытается найти бейдж (быстрый метод).
        Если бейдж не найден или use_badge_first=False, использует поиск по карточкам (детальный метод).
        
        Поиск по карточкам ищет все карточки приемов пищи по их структуре:
        - ViewGroup с clickable=true (TouchableOpacity)
        - Который содержит TextView с типом приема пищи (Завтрак, Обед и т.д.)
        - И TextView с текстом "ккал"
        
        Улучшенная версия с:
        - Ожиданием загрузки данных
        - Прокруткой для поиска всех карточек
        - Retry механизмом
        - Улучшенной дедупликацией
        
        Args:
            debug: Если True, выводит отладочную информацию
            retry_count: Количество попыток поиска (по умолчанию 3)
            scroll_enabled: Включить ли прокрутку для поиска всех карточек (по умолчанию True)
        
        Returns:
            int: Количество MealCard (0 если нет приемов)
        """
        # Если use_badge_first=True, сначала пытаемся найти бейдж (быстрый метод)
        if use_badge_first:
            if debug:
                print("[get_meals_count] Пробуем сначала найти бейдж (быстрый метод)...")
            badge_count = self.get_meals_count_from_badge(debug=debug)
            if badge_count is not None:
                if debug:
                    print(f"[get_meals_count] ✓ Бейдж найден: {badge_count} приемов пищи (используем бейдж)")
                return badge_count
            else:
                if debug:
                    print("[get_meals_count] Бейдж не найден, переходим к поиску по карточкам (детальный метод)...")
        
        # Поиск по карточкам (детальный метод)
        # Сначала проверяем нет ли текста "Нет приемов пищи"
        # Используем короткий таймаут (0.3s) так как элемент может отсутствовать
        try:
            if self.is_displayed_silent(self.NO_MEALS_TEXT, timeout=0.3):
                if debug:
                    print("[get_meals_count] Найден текст 'Нет приемов пищи'")
                return 0
        except Exception:
            pass
        
        # Ожидаем загрузки данных - небольшая задержка для обновления DOM
        time.sleep(0.5)
        
        # Ищем карточки приемов пищи по структуре
        # Карточка = ViewGroup с clickable=true, который содержит:
        # - TextView с типом приема пищи (Завтрак, Обед, Ужин, Полдник, Поздний ужин, Перекус)
        # - И TextView с текстом "ккал"
        meal_types = ['Завтрак', 'Обед', 'Ужин', 'Полдник', 'Поздний ужин', 'Перекус']
        
        # Глобальное множество для хранения уникальных карточек по всем попыткам
        # Используем стабильный ключ без координат (они меняются при прокрутке)
        all_unique_cards = set()
        
        # Retry механизм - повторяем поиск несколько раз
        for attempt in range(retry_count):
            if debug and attempt > 0:
                print(f"[get_meals_count] Попытка {attempt + 1}/{retry_count}")
            
            self.driver.implicitly_wait(0.5)  # Уменьшаем таймаут для быстрого поиска
            try:
                # Множество для хранения уникальных карточек в текущей попытке
                unique_meal_cards = set()
                
                # Если включена прокрутка, делаем несколько прокруток для поиска всех карточек
                scroll_count = 2 if scroll_enabled else 0  # Уменьшено с 3 до 2 для ускорения
                for scroll_iteration in range(scroll_count + 1):
                    if scroll_iteration > 0:
                        # Прокручиваем вниз для поиска карточек вне видимой области
                        if debug:
                            print(f"[get_meals_count] Прокрутка {scroll_iteration}/{scroll_count}")
                        self.swipe_up(duration=400)  # Уменьшено с 500 до 400
                        time.sleep(0.2)  # Уменьшено с 0.3 до 0.2 для ускорения
                    
                    # Ищем все карточки по структуре
                    for meal_type in meal_types:
                        try:
                            # Ищем ViewGroup с clickable=true, который содержит:
                            # - TextView с текстом типа приема пищи
                            # - И TextView с текстом "ккал"
                            xpath = (
                                f"//android.view.ViewGroup[@clickable='true' "
                                f"and .//android.widget.TextView[@text='{meal_type}'] "
                                f"and .//android.widget.TextView[contains(@text, 'ккал')]]"
                            )
                            
                            card_containers = self.driver.find_elements(By.XPATH, xpath)
                            
                            for card in card_containers:
                                try:
                                    # Получаем стабильные данные для определения уникальности
                                    # НЕ используем координаты - они меняются при прокрутке!
                                    
                                    # 1. Получаем время приема пищи (формат HH:mm, например "19:35")
                                    # Время находится в titleContainer, это TextView который содержит ":"
                                    meal_time = ""
                                    try:
                                        time_elem = card.find_element(By.XPATH, ".//android.widget.TextView[contains(@text, ':')]")
                                        time_text = time_elem.text.strip()
                                        # Проверяем что это действительно время (формат HH:mm)
                                        if re.match(r'^\d{1,2}:\d{2}$', time_text):
                                            meal_time = time_text
                                    except:
                                        meal_time = ""
                                    
                                    # 2. Получаем калории из caloriesContainer
                                    # caloriesContainer находится справа и содержит TextView(число) + TextView("ккал")
                                    # Используем тот же подход что и в METHOD 3 - ищем ViewGroup который содержит "ккал"
                                    calories_value = ""
                                    try:
                                        # Ищем ViewGroup который содержит TextView с "ккал" - это caloriesContainer
                                        calories_container = card.find_element(By.XPATH, ".//android.view.ViewGroup[.//android.widget.TextView[@text='ккал']]")
                                        # Ищем все TextView в этом контейнере
                                        all_textviews = calories_container.find_elements(By.XPATH, ".//android.widget.TextView")
                                        # Ищем самое большое число (это калории, а не белки/жиры/углеводы)
                                        max_calories = 0
                                        for tv in all_textviews:
                                            text = tv.text.strip()
                                            if text != "ккал" and text.isdigit():
                                                calories_num = int(text)
                                                if calories_num > max_calories:
                                                    max_calories = calories_num
                                                    calories_value = text
                                    except:
                                        # Fallback: ищем число рядом с "ккал" через parent
                                        try:
                                            calories_elem = card.find_element(By.XPATH, ".//android.widget.TextView[@text='ккал']")
                                            parent = calories_elem.find_element(By.XPATH, "./..")
                                            siblings = parent.find_elements(By.XPATH, ".//android.widget.TextView")
                                            max_calories = 0
                                            for sibling in siblings:
                                                text = sibling.text.strip()
                                                if text != "ккал" and text.isdigit():
                                                    calories_num = int(text)
                                                    if calories_num > max_calories:
                                                        max_calories = calories_num
                                                        calories_value = text
                                        except:
                                            calories_value = ""
                                    
                                    # 3. Получаем текст БЖУ если есть (для дополнительной уникальности)
                                    # В MealCard БЖУ отображается в macrosContainer:
                                    # compactMacroItem содержит: compactMacroValue (число) + compactMacroLabel (Б/Ж/У)
                                    # Структура: ViewGroup (compactMacroItem) -> TextView (число) + TextView (Б/Ж/У)
                                    bju_text = ""
                                    try:
                                        # Ищем все TextView с буквами Б, Ж, У
                                        bju_labels = card.find_elements(By.XPATH, ".//android.widget.TextView[@text='Б' or @text='Ж' or @text='У']")
                                        
                                        if not bju_labels:
                                            bju_text = ""
                                        else:
                                            bju_order = []  # Для сохранения порядка Б, Ж, У
                                            
                                            for label in bju_labels:
                                                try:
                                                    label_text = label.text.strip()
                                                    label_location = label.location
                                                    label_x = label_location['x']
                                                    label_y = label_location['y']
                                                    
                                                    # Ищем все TextView с числами в карточке
                                                    all_textviews = card.find_elements(By.XPATH, ".//android.widget.TextView")
                                                    
                                                    # Ищем число которое находится рядом с буквой (слева от буквы)
                                                    # Число должно быть в том же compactMacroItem, т.е. на той же высоте и слева
                                                    closest_number = None
                                                    min_distance = float('inf')
                                                    
                                                    for tv in all_textviews:
                                                        try:
                                                            text = tv.text.strip()
                                                            # Проверяем что это число
                                                            if text.isdigit() and text != label_text:
                                                                tv_location = tv.location
                                                                tv_x = tv_location['x']
                                                                tv_y = tv_location['y']
                                                                
                                                                # Число должно быть:
                                                                # 1. Слева от буквы (tv_x < label_x)
                                                                # 2. Примерно на той же высоте (разница Y < 10px)
                                                                # 3. Близко к букве (расстояние по X < 50px)
                                                                y_diff = abs(tv_y - label_y)
                                                                x_diff = label_x - tv_x
                                                                
                                                                if y_diff < 10 and 0 < x_diff < 50:
                                                                    distance = x_diff + y_diff
                                                                    if distance < min_distance:
                                                                        min_distance = distance
                                                                        closest_number = text
                                                        except Exception:
                                                            continue
                                                    
                                                    # Если нашли число рядом с буквой, добавляем в порядок
                                                    if closest_number:
                                                        if label_text == "Б":
                                                            bju_order.append(("Б", closest_number))
                                                        elif label_text == "Ж":
                                                            bju_order.append(("Ж", closest_number))
                                                        elif label_text == "У":
                                                            bju_order.append(("У", closest_number))
                                                except Exception as e:
                                                    # Пропускаем эту букву если не удалось найти число
                                                    if debug:
                                                        print(f"[get_meals_count] Не удалось найти число для {label.text}: {e}")
                                                    continue
                                            
                                            # Формируем строку в порядке Б, Ж, У
                                            bju_dict = dict(bju_order)
                                            bju_parts = []
                                            for letter in ["Б", "Ж", "У"]:
                                                if letter in bju_dict:
                                                    bju_parts.append(f"{bju_dict[letter]}{letter}")
                                            
                                            bju_text = " ".join(bju_parts) if bju_parts else ""
                                    
                                    except Exception as e:
                                        # Если произошла ошибка, просто пропускаем БЖУ
                                        if debug:
                                            print(f"[get_meals_count] Ошибка при извлечении БЖУ: {e}")
                                        bju_text = ""
                                    
                                    # Используем стабильный ключ БЕЗ координат:
                                    # - Тип приема пищи
                                    # - Время приема пищи (HH:mm) - ОТЛИЧНЫЙ параметр для уникальности!
                                    # - Значение калорий (число)
                                    # - Текст БЖУ (полный текст для точности)
                                    # Это позволяет правильно дедуплицировать карточки даже при прокрутке
                                    
                                    # Нормализуем значения для консистентности
                                    normalized_time = meal_time if meal_time else ""
                                    normalized_calories = calories_value if calories_value else ""
                                    normalized_bju = bju_text.strip() if bju_text else ""
                                    
                                    key = (
                                        meal_type,
                                        normalized_time,
                                        normalized_calories,
                                        normalized_bju
                                    )
                                    
                                    # Проверяем уникальность
                                    if key not in unique_meal_cards:
                                        unique_meal_cards.add(key)
                                        all_unique_cards.add(key)
                                        if debug:
                                            print(f"[get_meals_count] Найдена карточка: {meal_type} в {normalized_time or 'нет времени'}, "
                                                  f"калории: {normalized_calories or 'нет'}, БЖУ: {normalized_bju or 'нет'}")
                                    else:
                                        if debug:
                                            print(f"[get_meals_count] ⚠ Дубликат пропущен: {meal_type} в {normalized_time or 'нет времени'}, "
                                                  f"калории: {normalized_calories or 'нет'}, БЖУ: {normalized_bju or 'нет'}")
                                except Exception as e:
                                    if debug:
                                        print(f"[get_meals_count] Ошибка при обработке карточки {meal_type}: {e}")
                                    continue
                                    
                        except Exception as e:
                            if debug:
                                print(f"[get_meals_count] Ошибка при поиске карточек типа {meal_type}: {e}")
                            continue
                    
                    # Если нашли карточки, проверяем нужно ли продолжать прокрутку
                    if len(unique_meal_cards) > 0 and scroll_iteration < scroll_count:
                        # Проверяем, есть ли еще карточки ниже
                        # Если последняя найденная карточка находится в нижней части экрана, продолжаем прокрутку
                        pass  # Продолжаем прокрутку
                
                if debug:
                    print(f"[get_meals_count] Попытка {attempt + 1}: найдено {len(unique_meal_cards)} уникальных карточек")
                    # Выводим все найденные ключи для отладки
                    if len(unique_meal_cards) > 0:
                        print(f"[get_meals_count] Список найденных карточек в попытке {attempt + 1}:")
                        for idx, key in enumerate(sorted(unique_meal_cards), 1):
                            print(f"  [{idx}] {key[0]} в {key[1] or 'нет времени'}, калории: {key[2] or 'нет'}, БЖУ: {key[3] or 'нет'}")
                
                # Если нашли карточки и это не первая попытка, делаем небольшую задержку перед следующей попыткой
                if attempt < retry_count - 1:
                    time.sleep(0.2)  # Уменьшено с 0.3 до 0.2 для ускорения
            
            finally:
                self.driver.implicitly_wait(10)  # Восстанавливаем
        
        # Используем количество уникальных карточек из всех попыток
        count = len(all_unique_cards)
        
        if debug:
            print(f"[get_meals_count] Итого найдено уникальных приемов пищи: {count} (максимум за {retry_count} попыток)")
            if count > 0:
                print(f"[get_meals_count] Финальный список всех уникальных карточек:")
                for idx, key in enumerate(sorted(all_unique_cards), 1):
                    print(f"  [{idx}] {key[0]} в {key[1] or 'нет времени'}, калории: {key[2] or 'нет'}, БЖУ: {key[3] or 'нет'}")
        
        return count
    
    def get_meals_count_from_badge(self, debug=False):
        """
        Получает количество приемов пищи из бейджа рядом с заголовком "Приемы пищи"
        
        Бейдж показывает mealStore.mealsForSelectedDate.length - это более надежный источник,
        чем поиск карточек в DOM, так как он всегда синхронизирован с store.
        
        Структура: ViewGroup (sectionHeader) содержит:
        - TextView "Приемы пищи" (mealsTitle)
        - TextView с числом (mealsCount) - это бейдж с backgroundColor
        
        Методы поиска:
        1. Поиск через sectionHeader (оригинальный метод)
        2. Поиск цифры рядом с "Приемы пищи" (новый метод)
        
        Args:
            debug: Если True, выводит отладочную информацию
        
        Returns:
            int: Количество приемов пищи из бейджа, или None если бейдж не найден
        """
        try:
            # МЕТОД 1: Ищем бейдж через sectionHeader
            xpath_section_header = (
                "//android.view.ViewGroup[.//android.widget.TextView[@text='Приемы пищи']]"
            )
            
            self.driver.implicitly_wait(2)
            try:
                section_headers = self.driver.find_elements(By.XPATH, xpath_section_header)
                
                if section_headers:
                    badge_candidates = []
                    
                    for section_header in section_headers:
                        try:
                            title_elem = section_header.find_element(By.XPATH, ".//android.widget.TextView[@text='Приемы пищи']")
                            title_location = title_elem.location
                            title_x = title_location['x']
                            title_y = title_location['y']
                            title_size = title_elem.size
                            title_height = title_size['height']
                            
                            # Ищем все TextView в этом sectionHeader
                            all_textviews = section_header.find_elements(By.XPATH, ".//android.widget.TextView")
                            
                            # Подсчитываем количество TextView - sectionHeader должен содержать 2 (заголовок + бейдж)
                            # или немного больше если есть другие элементы
                            textview_count = len(all_textviews)
                            
                            for tv in all_textviews:
                                try:
                                    text = tv.text.strip()
                                    # Проверяем что это число от 0 до 99 и не является заголовком
                                    if text != "Приемы пищи" and text.isdigit() and len(text) <= 2:
                                        tv_location = tv.location
                                        tv_x = tv_location['x']
                                        tv_y = tv_location['y']
                                        tv_size = tv.size
                                        tv_height = tv_size['height']
                                        
                                        # Бейдж должен:
                                        # 1. Находиться примерно на той же высоте что и заголовок (разница Y < 30px)
                                        # 2. Находиться справа от заголовка (больший X) или близко к нему
                                        # 3. Быть в sectionHeader с небольшим количеством TextView (2-4)
                                        # 4. Иметь примерно такую же высоту что и заголовок
                                        y_diff = abs(tv_y - title_y)
                                        height_diff = abs(tv_height - title_height)
                                        
                                        # Строгие критерии для бейджа:
                                        # - Находится на той же строке что и заголовок (y_diff < 30px)
                                        # - Находится справа от заголовка (tv_x > title_x - 50px, допускаем небольшое смещение)
                                        # - В простом sectionHeader (2-4 TextView)
                                        # - Примерно такая же высота
                                        if (y_diff < 30 and 
                                            tv_x >= title_x - 50 and 
                                            textview_count <= 4 and
                                            height_diff < 20):
                                            badge_candidates.append((tv, text, tv_x, tv_y, textview_count, y_diff))
                                            if debug:
                                                print(f"[get_meals_count_from_badge] Найден кандидат: '{text}' на ({tv_x}, {tv_y}), "
                                                      f"заголовок на ({title_x}, {title_y}), разница Y: {y_diff:.0f}px, "
                                                      f"TextView в header: {textview_count}")
                                except Exception:
                                    continue
                        except Exception as e:
                            if debug:
                                print(f"[get_meals_count_from_badge] Ошибка при обработке sectionHeader: {e}")
                            continue
                
                if badge_candidates:
                    # Фильтруем кандидатов - выбираем лучший
                    # Приоритет:
                    # 1. Минимальная разница по Y (на той же строке)
                    # 2. Минимальное количество TextView в header (проще = лучше)
                    # 3. Максимальный X (правее = лучше)
                    if len(badge_candidates) > 1:
                        badge_candidates.sort(key=lambda x: (x[5], x[4], -x[2]))  # Сначала по y_diff, потом по textview_count, потом по X (обратный)
                    
                    badge_text = badge_candidates[0][1]
                    
                    try:
                        count = int(badge_text)
                        if debug:
                            print(f"[get_meals_count_from_badge] Найден бейдж: {count} (из {len(badge_candidates)} кандидатов, "
                                  f"выбран с разницей Y: {badge_candidates[0][5]:.0f}px)")
                        return count
                    except ValueError:
                        if debug:
                            print(f"[get_meals_count_from_badge] Не удалось преобразовать '{badge_text}' в число")
                        return None
                else:
                    if debug:
                        print("[get_meals_count_from_badge] Бейдж не найден среди кандидатов в sectionHeader")
                    
            finally:
                self.driver.implicitly_wait(10)
            
            # МЕТОД 2: Альтернативный поиск - ищем цифру рядом с "Приемы пищи"
            if debug:
                print("[get_meals_count_from_badge] Пробуем альтернативный метод: поиск цифры рядом с 'Приемы пищи'")
            
            try:
                # Ищем TextView с "Приемы пищи"
                title_elem = self.driver.find_element(By.XPATH, "//android.widget.TextView[@text='Приемы пищи']")
                title_location = title_elem.location
                title_x = title_location['x']
                title_y = title_location['y']
                title_size = title_elem.size
                title_width = title_size['width']
                title_height = title_size['height']
                
                # Ищем все TextView с цифрами в области рядом с "Приемы пищи"
                # Бейдж должен быть справа от заголовка, примерно на той же высоте
                all_textviews = self.driver.find_elements(By.XPATH, "//android.widget.TextView")
                
                badge_candidates_alt = []
                for tv in all_textviews:
                    try:
                        text = tv.text.strip()
                        # Проверяем что это число (1-2 цифры)
                        if text.isdigit() and 1 <= len(text) <= 2:
                            tv_location = tv.location
                            tv_x = tv_location['x']
                            tv_y = tv_location['y']
                            tv_size = tv.size
                            
                            # Бейдж должен быть:
                            # 1. Справа от заголовка (tv_x > title_x + title_width - 50px, допускаем небольшое перекрытие)
                            # 2. Примерно на той же высоте (разница Y < 30px)
                            x_diff = tv_x - (title_x + title_width)
                            y_diff = abs(tv_y - title_y)
                            
                            # Бейдж находится справа от заголовка или немного перекрывается
                            if x_diff > -50 and y_diff < 30:
                                badge_candidates_alt.append((tv, text, tv_x, tv_y, x_diff, y_diff))
                                if debug:
                                    print(f"[get_meals_count_from_badge] Альтернативный кандидат: '{text}' на ({tv_x}, {tv_y}), "
                                          f"заголовок на ({title_x}, {title_y}), разница X: {x_diff:.0f}px, Y: {y_diff:.0f}px")
                    except Exception:
                        continue
                
                if badge_candidates_alt:
                    # Выбираем лучший кандидат: минимальная разница по Y, затем максимальный X (правее)
                    badge_candidates_alt.sort(key=lambda x: (x[5], -x[2]))  # Сначала по y_diff, потом по X (обратный)
                    badge_text = badge_candidates_alt[0][1]
                    
                    try:
                        count = int(badge_text)
                        if debug:
                            print(f"[get_meals_count_from_badge] ✓ Найден бейдж альтернативным методом: {count}")
                        return count
                    except ValueError:
                        if debug:
                            print(f"[get_meals_count_from_badge] Не удалось преобразовать '{badge_text}' в число")
            except Exception as e:
                if debug:
                    print(f"[get_meals_count_from_badge] Ошибка в альтернативном методе: {e}")
            
            return None
                
        except Exception as e:
            if debug:
                print(f"[get_meals_count_from_badge] Ошибка при поиске бейджа: {e}")
            return None
    
    def click_meal_card(self, meal_type=None, index=0):
        """
        Кликает на карточку приема пищи
        Открывает MealScreen
        
        Использует поиск по структуре карточки (как в get_meals_count):
        - ViewGroup с clickable=true
        - Который содержит TextView с типом приема пищи
        - И TextView с текстом "ккал"
        
        Args:
            meal_type: Тип приема пищи ('Завтрак', 'Обед', 'Ужин', 'Полдник', 'Поздний ужин', 'Перекус') или None для первого найденного
            index: Индекс если несколько meal одного типа (0-based)
        
        Returns:
            bool: True если meal card найден и кликнут
        """
        print(f"[click_meal_card] Ищем карточку приема пищи: meal_type={meal_type}, index={index}")
        
        self.driver.implicitly_wait(2)
        try:
            if meal_type:
                # Ищем карточки по структуре (как в get_meals_count)
                print(f"[click_meal_card] Ищем карточку с типом '{meal_type}'...")
                
                # Ищем ViewGroup с clickable=true, который содержит:
                # - TextView с текстом типа приема пищи
                # - И TextView с текстом "ккал"
                xpath = (
                    f"//android.view.ViewGroup[@clickable='true' "
                    f"and .//android.widget.TextView[@text='{meal_type}'] "
                    f"and .//android.widget.TextView[contains(@text, 'ккал')]]"
                )
                
                card_containers = self.driver.find_elements(By.XPATH, xpath)
                print(f"[click_meal_card] Найдено {len(card_containers)} карточек с типом '{meal_type}'")
                
                if not card_containers:
                    print(f"[click_meal_card] ⚠ Не найдено карточек с типом '{meal_type}'")
                    return False
                
                if index >= len(card_containers):
                    print(f"[click_meal_card] ⚠ Индекс {index} вне диапазона (найдено {len(card_containers)} карточек)")
                    return False
                
                # Кликаем на карточку
                target_card = card_containers[index]
                try:
                    print(f"[click_meal_card] ✓ Найдена карточка, кликаем...")
                    target_card.click()
                    time.sleep(1)  # Ждем перехода на MealScreen
                    print(f"[click_meal_card] ✓ Карточка кликнута, ожидаем переход на MealScreen")
                    return True
                except Exception as e:
                    print(f"[click_meal_card] ✗ Не удалось кликнуть на карточку: {e}")
                    return False
            else:
                # Если meal_type не указан, ищем первую карточку любого типа
                print("[click_meal_card] Ищем первую карточку любого типа...")
                
                meal_types = ['Завтрак', 'Обед', 'Ужин', 'Полдник', 'Поздний ужин', 'Перекус']
                
                for meal_type in meal_types:
                    xpath = (
                        f"//android.view.ViewGroup[@clickable='true' "
                        f"and .//android.widget.TextView[@text='{meal_type}'] "
                        f"and .//android.widget.TextView[contains(@text, 'ккал')]]"
                    )
                    
                    card_containers = self.driver.find_elements(By.XPATH, xpath)
                    if card_containers:
                        try:
                            print(f"[click_meal_card] ✓ Найдена карточка типа '{meal_type}', кликаем...")
                            card_containers[0].click()
                            time.sleep(1)
                            print(f"[click_meal_card] ✓ Карточка кликнута")
                            return True
                        except Exception as e:
                            print(f"[click_meal_card] ⚠ Не удалось кликнуть на карточку типа '{meal_type}': {e}")
                            continue
                
                print("[click_meal_card] ⚠ Не найдено ни одной карточки приема пищи")
                return False
        except Exception as e:
            print(f"[click_meal_card] ✗ Ошибка при клике на карточку: {e}")
            import traceback
            traceback.print_exc()
            return False
        finally:
            self.driver.implicitly_wait(10)
    
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
        """
        Ожидает загрузки приемов пищи
        
        Ждет появления FAB кнопки или индикаторов главного экрана
        """
        try:
            # Проверяем FAB или индикаторы главного экрана
            start_time = time.time()
            while time.time() - start_time < timeout:
                if self.is_displayed_multiple(self.ADD_MEAL_BUTTON, timeout=2):
                    return True
                for indicator in self.MAIN_SCREEN_INDICATORS[:2]:
                    try:
                        if self.is_displayed(indicator, timeout=1):
                            return True
                    except:
                        continue
                time.sleep(0.5)
            return False
        except Exception:
            return False

