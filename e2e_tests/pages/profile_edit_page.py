"""
Page Object для экрана редактирования профиля
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class ProfileEditPage(BasePage):
    """Класс для работы с экраном редактирования профиля"""
    
    # Locators
    HEIGHT_INPUT = (By.XPATH, "//*[@text='Рост (см)' or contains(@text, 'Рост')]/following-sibling::*//android.widget.EditText")
    # Структура: <View> -> <Text>Пол</Text> -> <TouchableOpacity (ViewGroup)> -> <Text>Мужской</Text> + <Text>▼</Text>
    # TouchableOpacity в React Native рендерится как android.view.ViewGroup
    GENDER_PICKER = [
        # Вариант 1: Клик по родительскому ViewGroup текста значения (TouchableOpacity)
        (By.XPATH, "//*[@text='Мужской' or @text='Женский']/.."),
        # Вариант 2: Клик по ViewGroup, который содержит текст значения
        (By.XPATH, "//android.view.ViewGroup[.//*[@text='Мужской' or @text='Женский']]"),
        # Вариант 3: Клик по тексту текущего значения (может работать, если кликабельный)
        (By.XPATH, "//*[@text='Мужской' or @text='Женский']"),
        # Вариант 4: Клик по ViewGroup, который является sibling для текста "Пол"
        (By.XPATH, "//*[@text='Пол']/following-sibling::android.view.ViewGroup[1]"),
        (By.XPATH, "//*[contains(@text, 'Пол')]/following-sibling::android.view.ViewGroup[1]"),
        # Вариант 5: Клик по ViewGroup, который находится после текста "Пол" в том же родителе
        (By.XPATH, "//*[@text='Пол']/../android.view.ViewGroup"),
        # Вариант 6: Клик по любому ViewGroup рядом с текстом "Пол"
        (By.XPATH, "//*[@text='Пол']/following-sibling::*[1]"),
    ]
    BIRTHDAY_INPUT = (By.XPATH, "//*[@text='Дата рождения' or contains(@text, 'Дата рождения')]/following-sibling::*//android.widget.EditText")
    # Структура такая же, как у GENDER_PICKER: TouchableOpacity (ViewGroup) с Text внутри
    # В коде используются: 'Сбросить вес', 'Сохранить вес', 'Набрать вес' (из TARGET_WEIGHT_TYPES)
    TARGET_WEIGHT_TYPE_PICKER = [
        # Вариант 1: Клик по родительскому ViewGroup текста значения (TouchableOpacity)
        (By.XPATH, "//*[@text='Сбросить вес' or @text='Сохранить вес' or @text='Набрать вес']/.."),
        # Вариант 2: Клик по ViewGroup, который содержит текст значения
        (By.XPATH, "//android.view.ViewGroup[.//*[@text='Сбросить вес' or @text='Сохранить вес' or @text='Набрать вес']]"),
        # Вариант 3: Клик по тексту текущего значения
        (By.XPATH, "//*[@text='Сбросить вес' or @text='Сохранить вес' or @text='Набрать вес']"),
        # Вариант 4: Клик по ViewGroup, который является sibling для текста "Цель"
        (By.XPATH, "//*[@text='Цель']/following-sibling::android.view.ViewGroup[1]"),
        (By.XPATH, "//*[contains(@text, 'Цель')]/following-sibling::android.view.ViewGroup[1]"),
        # Вариант 5: Клик по ViewGroup, который находится после текста "Цель" в том же родителе
        (By.XPATH, "//*[@text='Цель']/../android.view.ViewGroup"),
    ]
    # В коде label="Целевой вес (кг)" - нужно учесть это в локаторе
    TARGET_WEIGHT_INPUT = [
        (By.XPATH, "//*[@text='Целевой вес (кг)' or contains(@text, 'Целевой вес (кг)')]/following-sibling::*//android.widget.EditText"),
        (By.XPATH, "//*[@text='Целевой вес' or contains(@text, 'Целевой вес')]/following-sibling::*//android.widget.EditText"),
    ]
    # Структура такая же, как у GENDER_PICKER: TouchableOpacity (ViewGroup) с Text внутри
    ACTIVITY_LEVEL_PICKER = [
        # Вариант 1: Клик по родительскому ViewGroup текста значения (TouchableOpacity)
        (By.XPATH, "//*[@text='Минимальная активность' or @text='Легкая активность' or @text='Умеренная активность']/.."),
        # Вариант 2: Клик по ViewGroup, который содержит текст значения
        (By.XPATH, "//android.view.ViewGroup[.//*[@text='Минимальная активность' or @text='Легкая активность' or @text='Умеренная активность']]"),
        # Вариант 3: Клик по тексту текущего значения
        (By.XPATH, "//*[@text='Минимальная активность' or @text='Легкая активность' or @text='Умеренная активность']"),
        # Вариант 4: Клик по ViewGroup, который является sibling для текста "Уровень активности"
        (By.XPATH, "//*[@text='Уровень активности']/following-sibling::android.view.ViewGroup[1]"),
        (By.XPATH, "//*[contains(@text, 'Уровень активности')]/following-sibling::android.view.ViewGroup[1]"),
        # Вариант 5: Клик по ViewGroup, который находится после текста "Уровень активности" в том же родителе
        (By.XPATH, "//*[@text='Уровень активности']/../android.view.ViewGroup"),
    ]
    DAY_LIMIT_CAL_INPUT = (By.XPATH, "//*[@text='Дневной лимит калорий' or contains(@text, 'Дневной лимит')]/following-sibling::*//android.widget.EditText")
    SAVE_BUTTON = [
        (By.XPATH, "//android.widget.Button[@text='Сохранить изменения']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Сохранить изменения')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Сохранить')]"),
        (By.XPATH, "//*[@text='Сохранить изменения']"),
        (By.XPATH, "//*[contains(@text, 'Сохранить изменения')]"),
        (By.XPATH, "//*[contains(@text, 'Сохранить')]"),
        # Для React Native Button может быть ViewGroup с Text внутри
        (By.XPATH, "//android.view.ViewGroup[.//*[@text='Сохранить изменения']]"),
        (By.XPATH, "//android.view.ViewGroup[.//*[contains(@text, 'Сохранить')]]"),
    ]
    BACK_BUTTON = (By.XPATH, "//*[@content-desc='Назад' or contains(@content-desc, 'Back')]")
    
    # Modal locators
    GENDER_MALE_OPTION = [
        (By.XPATH, "//*[@text='Мужской']"),
        (By.XPATH, "//*[contains(@text, 'Мужской')]"),
        (By.XPATH, "//android.widget.Button[@text='Мужской']"),
    ]
    GENDER_FEMALE_OPTION = [
        (By.XPATH, "//*[@text='Женский']"),
        (By.XPATH, "//*[contains(@text, 'Женский')]"),
        (By.XPATH, "//android.widget.Button[@text='Женский']"),
    ]
    # Опции из TARGET_WEIGHT_TYPES: 'Сбросить вес', 'Сохранить вес', 'Набрать вес'
    TARGET_LOSE_OPTION = [
        (By.XPATH, "//*[@text='Сбросить вес']"),
        (By.XPATH, "//*[contains(@text, 'Сбросить вес')]"),
    ]
    TARGET_SAVE_OPTION = [
        (By.XPATH, "//*[@text='Сохранить вес']"),
        (By.XPATH, "//*[contains(@text, 'Сохранить вес')]"),
    ]
    TARGET_GAIN_OPTION = [
        (By.XPATH, "//*[@text='Набрать вес']"),
        (By.XPATH, "//*[contains(@text, 'Набрать вес')]"),
    ]
    ACTIVITY_FIRST_OPTION = [
        (By.XPATH, "//*[@text='Минимальная активность']"),
        (By.XPATH, "//*[contains(@text, 'Минимальная активность')]"),
        (By.XPATH, "//*[contains(@text, 'Минимальная')]"),
    ]
    ACTIVITY_SECOND_OPTION = [
        (By.XPATH, "//*[@text='Легкая активность']"),
        (By.XPATH, "//*[contains(@text, 'Легкая активность')]"),
        (By.XPATH, "//*[contains(@text, 'Легкая')]"),
    ]
    ACTIVITY_THIRD_OPTION = [
        (By.XPATH, "//*[@text='Умеренная активность']"),
        (By.XPATH, "//*[contains(@text, 'Умеренная активность')]"),
        (By.XPATH, "//*[contains(@text, 'Умеренная')]"),
    ]
    MODAL_CANCEL_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Отмена')]")
    
    # Error messages
    ERROR_MESSAGE = (By.XPATH, "//*[contains(@text, 'ошибка') or contains(@text, 'Ошибка')]")
    VALIDATION_ERROR = (By.XPATH, "//*[contains(@text, 'должен') or contains(@text, 'обязателен')]")
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница редактирования профиля"""
        if timeout is None:
            timeout = 20
        
        # Проверяем наличие заголовка или основных элементов
        indicators = [
            (By.XPATH, "//*[@text='Редактирование профиля' or contains(@text, 'Редактирование')]"),
            self.HEIGHT_INPUT,
            self.SAVE_BUTTON,
        ]
        
        for indicator in indicators:
            try:
                if self.is_displayed(indicator, timeout=2):
                    return True
            except:
                continue
        
        return False
    
    def set_height(self, height):
        """Устанавливает рост"""
        print(f"[set_height] Устанавливаем рост: {height}")
        try:
            # Прокручиваем до поля ввода, если нужно
            self._scroll_to_input_if_needed(self.HEIGHT_INPUT)
            
            # Очищаем и вводим значение
            self.clear_and_type(self.HEIGHT_INPUT, str(height))
            time.sleep(0.5)
            
            # Проверяем, что значение установлено
            current_value = self.get_height()
            print(f"[set_height] Текущее значение после ввода: {current_value}")
            if current_value != str(height):
                print(f"[set_height] ⚠ Значение не совпадает! Ожидалось: {height}, получено: {current_value}")
                # Пробуем еще раз
                self.clear_and_type(self.HEIGHT_INPUT, str(height))
                time.sleep(0.5)
                current_value = self.get_height()
                print(f"[set_height] Значение после повторной попытки: {current_value}")
            else:
                print(f"[set_height] ✓ Значение успешно установлено: {current_value}")
        except Exception as e:
            print(f"[set_height] ✗ Ошибка при установке роста: {type(e).__name__}: {str(e)}")
            self.take_screenshot('set_height_error')
            raise
        return self
    
    def _scroll_to_input_if_needed(self, locator, max_scrolls=3):
        """Прокручивает до поля ввода, если оно не видно"""
        try:
            element = self.find_element_silent(locator, timeout=1)
            if element and element.is_displayed():
                return  # Элемент уже виден
        except:
            pass
        
        # Прокручиваем вниз, чтобы найти поле
        print(f"[_scroll_to_input_if_needed] Прокручиваем до поля ввода...")
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        start_y = size['height'] * 0.7
        end_y = size['height'] * 0.3
        
        for i in range(max_scrolls):
            try:
                element = self.find_element_silent(locator, timeout=0.5)
                if element and element.is_displayed():
                    print(f"[_scroll_to_input_if_needed] ✓ Поле найдено после прокрутки {i + 1}")
                    return
            except:
                pass
            
            if i < max_scrolls - 1:
                self.driver.swipe(start_x, start_y, start_x, end_y, 300)
                time.sleep(0.2)
    
    def get_height(self):
        """Получает текущее значение роста"""
        try:
            return self.get_text(self.HEIGHT_INPUT)
        except:
            return None
    
    def select_gender(self, gender):
        """Выбирает пол (male/female)"""
        print(f"[select_gender] Выбираем пол: {gender}")
        try:
            # Прокручиваем до поля выбора пола, если нужно
            print(f"[select_gender] Прокручиваем до поля выбора пола...")
            self._scroll_to_input_if_needed(self.GENDER_PICKER)
            time.sleep(0.3)
            
            # Делаем скриншот перед кликом
            self.take_screenshot('before_gender_click')
            
            # Кликаем на поле выбора пола
            print(f"[select_gender] Кликаем на поле выбора пола (пробуем {len(self.GENDER_PICKER)} локаторов)...")
            try:
                self.click_multiple(self.GENDER_PICKER, timeout=3)  # Уменьшили с 5 до 3
                print(f"[select_gender] ✓ Клик выполнен")
            except Exception as e:
                print(f"[select_gender] ⚠ Ошибка при клике: {e}, пробуем альтернативный способ...")
                # Альтернативный способ: клик по координатам или по тексту значения
                try:
                    # Пробуем найти элемент с текстом текущего значения и кликнуть на него
                    current_gender_text = "Мужской" if gender.lower() != 'male' and gender.lower() != 'мужской' else "Мужской"
                    current_gender_locator = (By.XPATH, f"//*[@text='{current_gender_text}']")
                    self.click(current_gender_locator, timeout=3)
                    print(f"[select_gender] ✓ Клик выполнен через альтернативный способ")
                except:
                    raise e
            
            time.sleep(1)  # Уменьшили с 2 до 1
            
            # Делаем скриншот после открытия модального окна
            self.take_screenshot('after_gender_modal_open')
            
            # Проверяем, что модальное окно открылось
            modal_title = (By.XPATH, "//*[@text='Выберите пол' or contains(@text, 'Выберите пол')]")
            try:
                if self.is_displayed(modal_title, timeout=2):
                    print(f"[select_gender] ✓ Модальное окно открыто")
                else:
                    print(f"[select_gender] ⚠ Модальное окно не найдено, но продолжаем...")
            except:
                print(f"[select_gender] ⚠ Не удалось проверить модальное окно, но продолжаем...")
            
            # Выбираем нужный пол
            if gender.lower() == 'male' or gender.lower() == 'мужской':
                print(f"[select_gender] Выбираем 'Мужской'...")
                self.click_multiple(self.GENDER_MALE_OPTION, timeout=5)
            else:
                print(f"[select_gender] Выбираем 'Женский'...")
                self.click_multiple(self.GENDER_FEMALE_OPTION, timeout=5)
            
            time.sleep(0.8)  # Уменьшили с 1.5 до 0.8
            print(f"[select_gender] ✓ Пол выбран: {gender}")
        except Exception as e:
            print(f"[select_gender] ✗ Ошибка при выборе пола: {type(e).__name__}: {str(e)}")
            self.take_screenshot('select_gender_error')
            raise
        return self
    
    def set_birthday(self, birthday):
        """Устанавливает дату рождения (формат: YYYY-MM-DD)"""
        print(f"[set_birthday] Устанавливаем дату рождения: {birthday}")
        try:
            # Прокручиваем до поля ввода, если нужно
            self._scroll_to_input_if_needed(self.BIRTHDAY_INPUT)
            
            # Очищаем и вводим значение
            self.clear_and_type(self.BIRTHDAY_INPUT, birthday)
            time.sleep(0.5)
            print(f"[set_birthday] ✓ Дата рождения установлена")
        except Exception as e:
            print(f"[set_birthday] ✗ Ошибка при установке даты рождения: {type(e).__name__}: {str(e)}")
            self.take_screenshot('set_birthday_error')
            raise
        return self
    
    def select_target_weight_type(self, target_type):
        """Выбирает цель по весу (lose/save/gain)"""
        print(f"[select_target_weight_type] Выбираем цель: {target_type}")
        try:
            # Прокручиваем до поля выбора цели, если нужно
            print(f"[select_target_weight_type] Прокручиваем до поля выбора цели...")
            self._scroll_to_input_if_needed(self.TARGET_WEIGHT_TYPE_PICKER)
            time.sleep(0.3)
            
            # Делаем скриншот перед кликом
            self.take_screenshot('before_target_click')
            
            # Кликаем на поле выбора цели
            print(f"[select_target_weight_type] Кликаем на поле выбора цели (пробуем {len(self.TARGET_WEIGHT_TYPE_PICKER)} локаторов)...")
            self.click_multiple(self.TARGET_WEIGHT_TYPE_PICKER, timeout=3)  # Уменьшили с 5 до 3
            print(f"[select_target_weight_type] ✓ Клик выполнен")
            time.sleep(1)  # Уменьшили с 2 до 1
            
            # Делаем скриншот после открытия модального окна
            self.take_screenshot('after_target_modal_open')
            
            # Выбираем нужную цель
            if target_type.lower() == 'lose' or target_type.lower() == 'похудеть':
                print(f"[select_target_weight_type] Выбираем 'Сбросить вес'...")
                self.click_multiple(self.TARGET_LOSE_OPTION, timeout=5)
            elif target_type.lower() == 'gain' or target_type.lower() == 'набрать':
                print(f"[select_target_weight_type] Выбираем 'Набрать вес'...")
                self.click_multiple(self.TARGET_GAIN_OPTION, timeout=5)
            else:
                print(f"[select_target_weight_type] Выбираем 'Сохранить вес'...")
                self.click_multiple(self.TARGET_SAVE_OPTION, timeout=5)
            
            time.sleep(0.8)  # Уменьшили с 1.5 до 0.8
            print(f"[select_target_weight_type] ✓ Цель выбрана: {target_type}")
        except Exception as e:
            print(f"[select_target_weight_type] ✗ Ошибка при выборе цели: {type(e).__name__}: {str(e)}")
            self.take_screenshot('select_target_weight_type_error')
            raise
        return self
    
    def set_target_weight(self, weight):
        """Устанавливает целевой вес"""
        print(f"[set_target_weight] Устанавливаем целевой вес: {weight}")
        try:
            # Прокручиваем до поля ввода, если нужно
            # TARGET_WEIGHT_INPUT теперь список, используем первый локатор для прокрутки
            if isinstance(self.TARGET_WEIGHT_INPUT, list):
                self._scroll_to_input_if_needed(self.TARGET_WEIGHT_INPUT[0])
            else:
                self._scroll_to_input_if_needed(self.TARGET_WEIGHT_INPUT)
            
            # Очищаем и вводим значение
            if isinstance(self.TARGET_WEIGHT_INPUT, list):
                # Используем первый локатор для clear_and_type
                self.clear_and_type(self.TARGET_WEIGHT_INPUT[0], str(weight))
            else:
                self.clear_and_type(self.TARGET_WEIGHT_INPUT, str(weight))
            time.sleep(0.5)
            print(f"[set_target_weight] ✓ Целевой вес установлен: {weight}")
        except Exception as e:
            print(f"[set_target_weight] ✗ Ошибка при установке целевого веса: {type(e).__name__}: {str(e)}")
            self.take_screenshot('set_target_weight_error')
            raise
        return self
    
    def select_activity_level(self, level):
        """Выбирает уровень активности (first/second/third)"""
        print(f"[select_activity_level] Выбираем уровень активности: {level}")
        try:
            # Прокручиваем до поля выбора уровня активности, если нужно
            print(f"[select_activity_level] Прокручиваем до поля выбора уровня активности...")
            self._scroll_to_input_if_needed(self.ACTIVITY_LEVEL_PICKER)
            time.sleep(0.3)
            
            # Делаем скриншот перед кликом
            self.take_screenshot('before_activity_click')
            
            # Кликаем на поле выбора уровня активности
            print(f"[select_activity_level] Кликаем на поле выбора уровня активности (пробуем {len(self.ACTIVITY_LEVEL_PICKER)} локаторов)...")
            self.click_multiple(self.ACTIVITY_LEVEL_PICKER, timeout=3)  # Уменьшили с 5 до 3
            print(f"[select_activity_level] ✓ Клик выполнен")
            time.sleep(1)  # Уменьшили с 2 до 1
            
            # Делаем скриншот после открытия модального окна
            self.take_screenshot('after_activity_modal_open')
            
            # Выбираем нужный уровень активности
            if level.lower() == 'first' or level.lower() == 'минимальная':
                print(f"[select_activity_level] Выбираем 'Минимальная активность'...")
                self.click_multiple(self.ACTIVITY_FIRST_OPTION, timeout=5)
            elif level.lower() == 'second' or level.lower() == 'легкая':
                print(f"[select_activity_level] Выбираем 'Легкая активность'...")
                self.click_multiple(self.ACTIVITY_SECOND_OPTION, timeout=5)
            else:
                print(f"[select_activity_level] Выбираем 'Умеренная активность'...")
                self.click_multiple(self.ACTIVITY_THIRD_OPTION, timeout=5)
            
            time.sleep(0.8)  # Уменьшили с 1.5 до 0.8
            print(f"[select_activity_level] ✓ Уровень активности выбран: {level}")
        except Exception as e:
            print(f"[select_activity_level] ✗ Ошибка при выборе уровня активности: {type(e).__name__}: {str(e)}")
            self.take_screenshot('select_activity_level_error')
            raise
        return self
    
    def set_day_limit_cal(self, calories):
        """Устанавливает дневной лимит калорий"""
        self.clear_and_type(self.DAY_LIMIT_CAL_INPUT, str(calories))
        time.sleep(0.5)
        return self
    
    def click_save(self):
        """Кликает на кнопку сохранения"""
        print(f"[click_save] Сохраняем изменения...")
        try:
            # Прокручиваем до кнопки сохранения (она внизу экрана)
            print(f"[click_save] Прокручиваем до кнопки сохранения...")
            self._scroll_to_save_button()
            time.sleep(0.3)  # Уменьшили с 0.5 до 0.3
            
            # Делаем скриншот перед кликом
            self.take_screenshot('before_save_click')
            
            # Кликаем на кнопку сохранения
            print(f"[click_save] Кликаем на кнопку сохранения (пробуем {len(self.SAVE_BUTTON)} локаторов)...")
            self.click_multiple(self.SAVE_BUTTON, timeout=2)  # Уменьшили с 3 до 2
            print(f"[click_save] ✓ Клик выполнен")
            # Убрали sleep - будем ждать загрузки страницы в тесте
        except Exception as e:
            print(f"[click_save] ✗ Ошибка при сохранении: {type(e).__name__}: {str(e)}")
            self.take_screenshot('click_save_error')
            raise
        return self
    
    def _scroll_to_save_button(self, max_scrolls=3):
        """Прокручивает до кнопки сохранения, если она не видна"""
        start_time = time.time()
        # Проверяем, видна ли кнопка
        try:
            element = self.find_element_silent(self.SAVE_BUTTON[0], timeout=0.5)  # Уменьшили с 1 до 0.5
            if element and element.is_displayed():
                print(f"[_scroll_to_save_button] Кнопка уже видна")
                return
        except:
            pass
        
        # Пробуем UiScrollable для быстрой прокрутки
        try:
            from appium.webdriver.common.appiumby import AppiumBy
            ui_scrollable_query = 'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("Сохранить"))'
            ui_scrollable_locator = (AppiumBy.ANDROID_UIAUTOMATOR, ui_scrollable_query)
            element = self.find_element_silent(ui_scrollable_locator, timeout=1.0)
            if element:
                print(f"[_scroll_to_save_button] ✓ Кнопка найдена через UiScrollable")
                time.sleep(0.2)
                elapsed = time.time() - start_time
                if elapsed > 0.5:
                    print(f"[TIMING] _scroll_to_save_button: {elapsed:.2f}с")
                return
        except:
            pass
        
        # Прокручиваем вниз, чтобы найти кнопку
        print(f"[_scroll_to_save_button] Прокручиваем до кнопки сохранения...")
        size = self.driver.get_window_size()
        start_x = size['width'] / 2
        start_y = size['height'] * 0.7
        end_y = size['height'] * 0.3
        
        for i in range(max_scrolls):
            try:
                # Пробуем найти кнопку после каждой прокрутки
                for locator in self.SAVE_BUTTON[:3]:  # Пробуем только первые 3 локатора для скорости
                    try:
                        element = self.find_element_silent(locator, timeout=0.3)  # Уменьшили с 0.5 до 0.3
                        if element and element.is_displayed():
                            print(f"[_scroll_to_save_button] ✓ Кнопка найдена после прокрутки {i + 1}")
                            elapsed = time.time() - start_time
                            if elapsed > 0.5:
                                print(f"[TIMING] _scroll_to_save_button: {elapsed:.2f}с")
                            return
                    except:
                        continue
            except:
                pass
            
            # Если не найдена, прокручиваем дальше
            if i < max_scrolls - 1:
                self.driver.swipe(start_x, start_y, start_x, end_y, 300)
                time.sleep(0.1)  # Уменьшили с 0.2 до 0.1
        
        elapsed = time.time() - start_time
        if elapsed > 0.5:
            print(f"[TIMING] _scroll_to_save_button: {elapsed:.2f}с")
        print(f"[_scroll_to_save_button] ⚠ Кнопка не найдена после прокрутки, но продолжаем...")
    
    def click_back(self):
        """Кликает на кнопку назад"""
        print(f"[click_back] Возвращаемся на экран профиля...")
        try:
            self.click(self.BACK_BUTTON)
            time.sleep(2)
            print(f"[click_back] ✓ Возврат выполнен")
        except Exception as e:
            print(f"[click_back] ✗ Ошибка при возврате: {type(e).__name__}: {str(e)}")
            # Fallback: используем системную кнопку назад
            try:
                self.driver.back()
                time.sleep(2)
                print(f"[click_back] ✓ Возврат выполнен через системную кнопку назад")
            except Exception as e2:
                print(f"[click_back] ✗ Не удалось вернуться: {e2}")
                raise
        return self
    
    def has_validation_error(self):
        """Проверяет наличие ошибки валидации"""
        try:
            return self.is_displayed(self.VALIDATION_ERROR, timeout=2)
        except:
            return False
    
    def get_validation_error_text(self):
        """Получает текст ошибки валидации"""
        try:
            return self.get_text(self.VALIDATION_ERROR)
        except:
            return None
    
    def has_error_message(self):
        """Проверяет наличие сообщения об ошибке"""
        try:
            return self.is_displayed(self.ERROR_MESSAGE, timeout=2)
        except:
            return False
