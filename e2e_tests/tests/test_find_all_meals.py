"""
Тест для поиска всех приемов пищи на главном экране

Исходное положение: главный экран с 6 приемами пищи
Пользователь: qweqwe@gmail.com / qweqweqwe

Тест выполняет:
1. Логин под указанным пользователем
2. Переход на главный экран
3. Поиск всех 6 приемов пищи с подробным логированием
4. Проверка что все приемы пищи найдены
"""
import os
import sys
import time
import pytest

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.sign_in_page import SignInPage
from pages.main_page import MainPage
from selenium.webdriver.common.by import By


class TestFindAllMeals:
    """
    Тест для поиска всех приемов пищи на главном экране
    """
    
    TEST_EMAIL = "qweqwe@gmail.com"
    TEST_PASSWORD = "qweqweqwe"
    EXPECTED_MEALS_COUNT = 6
    
    def test_find_all_meals_on_main_screen(self, driver, setup_test_environment):
        """
        Тест поиска всех 6 приемов пищи на главном экране
        
        User Flow:
        1. Логин под qweqwe@gmail.com / qweqweqwe
        2. Переход на главный экран
        3. Поиск всех приемов пищи с подробным логированием
        4. Проверка что найдено 6 приемов пищи
        """
        print("\n" + "="*60)
        print("ТЕСТ: Поиск всех приемов пищи на главном экране")
        print("="*60)
        
        # Шаг 1: Логин
        print(f"\n[STEP 1] Логин под пользователем {self.TEST_EMAIL}")
        sign_in_page = SignInPage(driver)
        
        # Убеждаемся что мы на странице входа
        if not sign_in_page.is_page_loaded(timeout=5):
            print("[STEP 1] ⚠ Не на странице входа, пытаемся перейти...")
            sign_in_page = SignInPage.ensure_sign_in_page(driver)
        
        sign_in_page.take_screenshot('01_sign_in_page')
        
        # Выполняем логин
        print(f"[STEP 1] Ввод email: {self.TEST_EMAIL}")
        sign_in_page.enter_email(self.TEST_EMAIL)
        time.sleep(0.5)
        
        print(f"[STEP 1] Ввод пароля: {'*' * len(self.TEST_PASSWORD)}")
        sign_in_page.enter_password(self.TEST_PASSWORD)
        time.sleep(0.5)
        
        print("[STEP 1] Нажатие кнопки входа...")
        sign_in_page.click_login_button()
        time.sleep(3)  # Ждем перехода на главный экран
        
        # Шаг 2: Проверка главного экрана
        print("\n[STEP 2] Проверка загрузки главного экрана")
        main_page = MainPage(driver)
        
        # Ждем загрузки главного экрана
        main_loaded = False
        for attempt in range(10):
            if main_page.is_page_loaded(timeout=2):
                main_loaded = True
                print(f"[STEP 2] ✓ Главный экран загружен (попытка {attempt + 1})")
                break
            time.sleep(1)
        
        if not main_loaded:
            pytest.fail("Главный экран не загрузился после логина")
        
        main_page.take_screenshot('02_main_page_loaded')
        
        # Шаг 3: Поиск всех приемов пищи
        print(f"\n[STEP 3] Поиск всех {self.EXPECTED_MEALS_COUNT} приемов пищи")
        print("-" * 60)
        
        # Метод 1: Поиск через бейдж (основной метод - простой и быстрый)
        print("\n[METHOD 1] Поиск через бейдж 'Приемы пищи' (основной метод)")
        badge_count = main_page.get_meals_count_from_badge(debug=True)
        if badge_count is not None:
            print(f"[METHOD 1] ✓ Бейдж найден: {badge_count} приемов пищи")
        else:
            print("[METHOD 1] ⚠ Бейдж не найден, используем поиск карточек")
        
        # Метод 2: Детальный поиск через карточки (для детального анализа)
        print("\n[METHOD 2] Детальный поиск через карточки приемов пищи")
        print("[METHOD 2] Начинаем поиск всех карточек с детальной информацией...")
        
        meals_count = main_page.get_meals_count(debug=True, retry_count=2, scroll_enabled=True, use_badge_first=False)
        print(f"[METHOD 2] ✓ Найдено карточек: {meals_count}")
        
        # Метод 3: Детальный поиск каждого типа приема пищи
        print("\n[METHOD 3] Детальный поиск по типам приемов пищи")
        print("-" * 60)
        
        meal_types = ['Завтрак', 'Обед', 'Ужин', 'Полдник', 'Поздний ужин', 'Перекус']
        found_meals_by_type = {}
        
        for meal_type in meal_types:
            print(f"\n[METHOD 3] Поиск приемов пищи типа: {meal_type}")
            
            try:
                # Ищем все карточки этого типа
                xpath = (
                    f"//android.view.ViewGroup[@clickable='true' "
                    f"and .//android.widget.TextView[@text='{meal_type}'] "
                    f"and .//android.widget.TextView[contains(@text, 'ккал')]]"
                )
                
                driver.implicitly_wait(2)
                try:
                    cards = driver.find_elements(By.XPATH, xpath)
                    count = len(cards)
                    found_meals_by_type[meal_type] = count
                    print(f"[METHOD 3] ✓ Найдено {count} приемов пищи типа '{meal_type}'")
                    
                    # Логируем детали каждой найденной карточки
                    for idx, card in enumerate(cards):
                        try:
                            location = card.location
                            size = card.size
                            
                            # Получаем время приема пищи
                            try:
                                time_elem = card.find_element(By.XPATH, f".//android.widget.TextView[contains(@text, ':')]")
                                meal_time = time_elem.text.strip()
                            except:
                                meal_time = "не найдено"
                            
                            # Получаем калории (самое большое число в caloriesContainer)
                            try:
                                calories_container = card.find_element(By.XPATH, ".//android.view.ViewGroup[.//android.widget.TextView[@text='ккал']]")
                                all_textviews = calories_container.find_elements(By.XPATH, ".//android.widget.TextView")
                                max_calories = 0
                                calories = "не найдено"
                                for tv in all_textviews:
                                    text = tv.text.strip()
                                    if text != "ккал" and text.isdigit():
                                        calories_num = int(text)
                                        if calories_num > max_calories:
                                            max_calories = calories_num
                                            calories = text
                            except:
                                calories = "не найдено"
                            
                            print(f"  [{idx + 1}] {meal_type} в {meal_time}, калории: {calories}, "
                                  f"позиция: ({location['x']}, {location['y']}), размер: {size['width']}x{size['height']}")
                        except Exception as e:
                            print(f"  [{idx + 1}] Ошибка при получении деталей карточки: {e}")
                finally:
                    driver.implicitly_wait(10)
                    
            except Exception as e:
                print(f"[METHOD 3] ✗ Ошибка при поиске '{meal_type}': {e}")
                found_meals_by_type[meal_type] = 0
        
        # Итоговая статистика
        print("\n" + "="*60)
        print("ИТОГОВАЯ СТАТИСТИКА")
        print("="*60)
        print(f"Бейдж показывает: {badge_count if badge_count is not None else 'не найден'}")
        print(f"Поиск карточек нашел: {meals_count}")
        print("\nПо типам приемов пищи:")
        total_by_type = 0
        for meal_type, count in found_meals_by_type.items():
            print(f"  - {meal_type}: {count}")
            total_by_type += count
        print(f"\nВсего по типам: {total_by_type}")
        
        # Финальный скриншот
        main_page.take_screenshot('03_final_state')
        
        # Проверки
        print("\n" + "="*60)
        print("ПРОВЕРКИ")
        print("="*60)
        
        # Проверка 1: Бейдж должен показывать правильное количество (основная проверка)
        if badge_count is not None:
            assert badge_count == self.EXPECTED_MEALS_COUNT, \
                f"Бейдж показывает неправильное количество: ожидалось {self.EXPECTED_MEALS_COUNT}, найдено {badge_count}"
            print(f"✓ Проверка 1 пройдена: бейдж показывает {badge_count} (основной метод)")
        else:
            # Если бейдж не найден, используем поиск карточек как fallback
            print("⚠ Бейдж не найден, используем поиск карточек как fallback")
            assert meals_count == self.EXPECTED_MEALS_COUNT, \
                f"Поиск карточек нашел неправильное количество: ожидалось {self.EXPECTED_MEALS_COUNT}, найдено {meals_count}"
            print(f"✓ Проверка 1 (fallback) пройдена: найдено {meals_count} карточек")
        
        # Проверка 2: Поиск карточек должен подтверждать результат бейджа (если бейдж найден)
        if badge_count is not None:
            assert meals_count == badge_count, \
                f"Несоответствие: бейдж показывает {badge_count}, поиск карточек нашел {meals_count}"
            print(f"✓ Проверка 2 пройдена: поиск карточек подтверждает результат бейджа ({meals_count})")
        
        # Проверка 3: Сумма по типам должна совпадать
        assert total_by_type == self.EXPECTED_MEALS_COUNT, \
            f"Сумма по типам не совпадает: ожидалось {self.EXPECTED_MEALS_COUNT}, найдено {total_by_type}"
        print(f"✓ Проверка 3 пройдена: сумма по типам = {total_by_type}")
        
        print("\n" + "="*60)
        print("✓ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО")
        print(f"✓ Найдено {self.EXPECTED_MEALS_COUNT} приемов пищи")
        print("="*60)
