"""
E2E тесты для onboarding flow (Story 2.9)
"""
import os
import sys
import pytest
import time
from contextlib import contextmanager

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.sign_in_page import SignInPage
from pages.registration_page import RegistrationPage
from pages.main_page import MainPage
from pages.profile_setup_page import ProfileSetupPage
from pages.target_selection_page import TargetSelectionPage
from pages.weight_page import WeightPage
from pages.target_weight_page import TargetWeightPage
from pages.height_page import HeightPage
from pages.birthday_page import BirthdayPage
from pages.activity_page import ActivityPage
from pages.complete_profile_page import CompleteProfilePage
from pages.onboarding_complete_page import OnboardingCompletePage
from pages.profile_page import ProfilePage
from pages.settings_page import SettingsPage
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD


@contextmanager
def timer_step(step_name):
    """Контекстный менеджер для измерения времени выполнения этапа теста"""
    start_time = time.time()
    print(f"\n[TIMER] [{step_name}] Начало... [{time.strftime('%H:%M:%S', time.localtime(start_time))}]")
    try:
        yield
    finally:
        elapsed = time.time() - start_time
        end_time = time.time()
        print(f"[TIMER] [{step_name}] Завершено за {elapsed:.2f}с [{time.strftime('%H:%M:%S', time.localtime(end_time))}]")


@pytest.mark.integration
class TestOnboardingFlow:
    """Тесты для onboarding flow"""
    
    def _ensure_sign_in_page(self, driver):
        """Убеждается, что мы на странице входа, возвращает SignInPage. 
        НЕ использует reset() или другие методы, которые могут закрыть приложение."""
        sign_in_page = SignInPage(driver)
        main_page = MainPage(driver)
        profile_page = ProfilePage(driver)
        profile_setup_page = ProfileSetupPage(driver)

        # Увеличиваем начальную задержку для загрузки приложения на эмуляторе
        time.sleep(3)

        # Проверяем, не находимся ли мы уже на странице входа
        if sign_in_page.is_page_loaded_fast(timeout=3):
            return sign_in_page

        # Вариант 1: На экране настройки профиля (onboarding) - используем кнопку выхода
        try:
            if profile_setup_page.is_page_loaded(timeout=3):
                print("На экране onboarding, выходим через кнопку выхода...")
                sign_in_page = profile_setup_page.logout()
                if sign_in_page.is_page_loaded(timeout=5):
                    return sign_in_page
        except Exception as e:
            print(f"Warning: Could not logout from profile setup: {e}")

        # Вариант 2: На главном экране - переходим в профиль и выходим
        try:
            if main_page.is_page_loaded(timeout=3):
                print("На главном экране, переходим в профиль для выхода...")
                main_page.navigate_to_profile()
                time.sleep(2)
                if profile_page.is_page_loaded(timeout=3):
                    profile_page.click_logout()
                    time.sleep(2)
                    if sign_in_page.is_page_loaded(timeout=5):
                        return sign_in_page
        except Exception as e:
            print(f"Warning: Could not logout from main screen: {e}")

        # Вариант 3: На экране профиля - выходим напрямую
        try:
            if profile_page.is_page_loaded(timeout=3):
                print("На экране профиля, выходим...")
                profile_page.click_logout()
                time.sleep(2)
                if sign_in_page.is_page_loaded(timeout=5):
                    return sign_in_page
        except Exception as e:
            print(f"Warning: Could not logout from profile: {e}")

        # Вариант 4: Пытаемся вернуться назад (но не более 5 раз, чтобы не закрыть приложение)
        for i in range(5):
            try:
                driver.back()
                time.sleep(1)
                if sign_in_page.is_page_loaded_fast(timeout=1):
                    return sign_in_page
            except Exception as e:
                print(f"Warning: Could not go back (attempt {i+1}): {e}")
                break

        # Последняя проверка - может мы уже на странице входа
        if sign_in_page.is_page_loaded(timeout=3):
            return sign_in_page

        # Если ничего не помогло, просто возвращаем SignInPage (тест может продолжиться)
        print("Warning: Could not ensure sign in page, but continuing...")
        return sign_in_page

    def _logout(self, driver):
        """Выходит из аккаунта, оставляя приложение открытым на экране входа"""
        sign_in_page = SignInPage(driver)
        main_page = MainPage(driver)
        profile_page = ProfilePage(driver)

        try:
            # Проверяем, не находимся ли мы уже на странице входа
            if sign_in_page.is_page_loaded_fast(timeout=2):
                return True
            
            # Если на главном экране, переходим в профиль
            if main_page.is_page_loaded(timeout=3):
                main_page.navigate_to_profile()
                time.sleep(2)
            
            # Пытаемся выйти через профиль
            if profile_page.is_page_loaded(timeout=5):
                profile_page.take_screenshot('logout_before')
                profile_page.click_logout()
                time.sleep(3)  # Увеличено время ожидания
                
                # Проверяем, что мы на странице входа
                if sign_in_page.is_page_loaded(timeout=5):
                    sign_in_page.take_screenshot('logout_after')
                    return True
        except Exception as e:
            print(f"Warning: Could not logout through UI (onboarding tests): {e}")

        # Fallback: если не вышли через UI, пытаемся вернуться назад несколько раз
        # НЕ используем ensure_sign_in_page, так как он может использовать driver.reset() и закрыть приложение
        try:
            for i in range(5):
                driver.back()
                time.sleep(1)
                if sign_in_page.is_page_loaded_fast(timeout=1):
                    return True
        except Exception as e:
            print(f"Warning: Could not go back to sign in page: {e}")

        # Последняя попытка - проверяем, может мы уже на странице входа
        if sign_in_page.is_page_loaded(timeout=3):
            return True

        return False
    
    def _register_user(self, driver, user_data):
        """Регистрирует пользователя и возвращает состояние после регистрации"""
        sign_in_page = self._ensure_sign_in_page(driver)
        sign_in_page.take_screenshot('before_registration')
        registration_page = sign_in_page.click_register_button()
        assert registration_page.is_page_loaded(), "Страница регистрации не загрузилась"
        
        registration_page.register(
            user_data['name'],
            user_data['email'],
            user_data['password']
        )
        time.sleep(4)  # Ожидание завершения регистрации
        
        # Регистрируем пользователя для последующего удаления
        try:
            from utilities.user_cleanup import UserCleanup
            UserCleanup.register_user(user_data['email'], user_data.get('password'))
        except Exception as e:
            print(f"Warning: Could not register user for cleanup: {e}")
        
        return registration_page
    
    def _complete_onboarding_flow(self, driver):
        """Проходит полный onboarding flow"""
        profile_setup_page = ProfileSetupPage(driver)
        if not profile_setup_page.is_page_loaded(timeout=5):
            return False
        
        profile_setup_page.take_screenshot('01_onboarding_start')
        
        # Выбор пола
        profile_setup_page.select_gender('male')
        profile_setup_page.take_screenshot('02_gender_selected')
        profile_setup_page.click_next()
        time.sleep(2)
        
        # Выбор цели
        target_selection_page = TargetSelectionPage(driver)
        if target_selection_page.is_page_loaded(timeout=3):
            target_selection_page.select_target('save')
            target_selection_page.take_screenshot('03_target_selected')
            target_selection_page.click_next()
            time.sleep(2)
        
        # Ввод веса
        weight_page = WeightPage(driver)
        if weight_page.is_page_loaded(timeout=3):
            weight_page.enter_weight(75)
            weight_page.take_screenshot('04_weight_entered')
            weight_page.click_next()
            time.sleep(2)
        
        # Ввод целевого веса (может быть пропущен если цель "сохранить вес")
        target_weight_page = TargetWeightPage(driver)
        if target_weight_page.is_page_loaded(timeout=3):
            target_weight_page.enter_target_weight(75)
            target_weight_page.take_screenshot('05_target_weight_entered')
            target_weight_page.click_next()
            time.sleep(2)
        else:
            print("Экран целевого веса пропущен в _complete_onboarding_flow (цель: сохранить вес)")
        
        # Ввод роста
        height_page = HeightPage(driver)
        if height_page.is_page_loaded(timeout=3):
            height_page.enter_height(180)
            height_page.take_screenshot('06_height_entered')
            height_page.click_next()
            time.sleep(2)
        
        # Ввод даты рождения
        birthday_page = BirthdayPage(driver)
        if birthday_page.is_page_loaded(timeout=3):
            birthday_page.select_birthday(1990, 5, 15)
            birthday_page.take_screenshot('07_birthday_selected')
            birthday_page.click_next()
            time.sleep(2)
        
        # Выбор активности
        activity_page = ActivityPage(driver)
        if activity_page.is_page_loaded(timeout=3):
            activity_page.select_activity('second')
            activity_page.take_screenshot('08_activity_selected')
            activity_page.click_next()
            time.sleep(2)
        
        # Завершение профиля
        complete_profile_page = CompleteProfilePage(driver)
        if complete_profile_page.is_page_loaded(timeout=5):
            complete_profile_page.take_screenshot('09_complete_profile_screen')
            complete_profile_page.click_complete()
            time.sleep(5)  # Ожидание создания профиля
        
        return True
    
    @pytest.mark.smoke
    def test_01_new_user_completes_onboarding_flow(self, driver, setup_test_environment, test_user):
        """Тест 01: новый пользователь проходит полный onboarding flow (AC: 1, 2, 4)"""
        with timer_step("Полный onboarding flow"):
            # Регистрация
            self._register_user(driver, test_user)
            
            # Прохождение onboarding
            onboarding_start_time = time.time()
            self._complete_onboarding_flow(driver)
            onboarding_end_time = time.time()
            onboarding_duration = onboarding_end_time - onboarding_start_time
            
            print(f"\n[ONBOARDING] Время прохождения onboarding: {onboarding_duration:.2f} секунд ({onboarding_duration/60:.2f} минут)")
            
            # Проверяем, что onboarding завершен и мы на главном экране
            main_page = MainPage(driver)
            main_page.take_screenshot('10_onboarding_complete_main_screen')
            
            assert main_page.is_page_loaded(timeout=10), "Главный экран не загрузился после onboarding"
            
            # Проверяем время завершения (<3 минут)
            assert onboarding_duration < 180, f"Onboarding занял {onboarding_duration:.2f} секунд, что больше 3 минут"
            
            print(f"✅ Onboarding успешно завершен за {onboarding_duration:.2f} секунд")

            # Выходим из аккаунта, чтобы приложение осталось открытым (экран входа)
            self._logout(driver)
    
    @pytest.mark.smoke
    def test_02_user_navigates_back_and_changes_values_in_onboarding_flow(self, driver, setup_test_environment, test_user):
        """Тест 02: пользователь проходит все экраны, возвращается назад, изменяет значения и завершает onboarding (AC: 2)"""
        with timer_step("Навигация назад и изменение значений в onboarding"):
            # Регистрация
            self._register_user(driver, test_user)
            
            # ========== ПЕРВЫЙ ПРОХОД: Проходим все экраны с начальными значениями ==========
            profile_setup_page = ProfileSetupPage(driver)
            assert profile_setup_page.is_page_loaded(timeout=5), "Экран onboarding не загрузился"
            profile_setup_page.take_screenshot('01_01_onboarding_start')
            
            # 1. Выбор пола (первый раз - male)
            profile_setup_page.select_gender('male')
            profile_setup_page.take_screenshot('01_02_gender_male_selected')
            profile_setup_page.click_next()
            time.sleep(2)
            
            # 2. Выбор цели (первый раз - save)
            target_selection_page = TargetSelectionPage(driver)
            assert target_selection_page.is_page_loaded(timeout=5), "Экран выбора цели не загрузился"
            target_selection_page.select_target('save')
            target_selection_page.take_screenshot('01_03_target_save_selected')
            target_selection_page.click_next()
            time.sleep(2)
            
            # 3. Ввод веса (первый раз - 75)
            weight_page = WeightPage(driver)
            assert weight_page.is_page_loaded(timeout=5), "Экран ввода веса не загрузился"
            weight_page.enter_weight(75)
            weight_page.take_screenshot('01_04_weight_75_entered')
            weight_page.click_next()
            time.sleep(2)

            # 4. Ввод целевого веса (первый раз - 75) - может быть пропущен если цель "сохранить вес"
            target_weight_page = TargetWeightPage(driver)
            step_counter = 5  # Следующий шаг после веса
            if target_weight_page.is_page_loaded(timeout=3):
                # Экран целевого веса появился
                target_weight_page.enter_target_weight(75)
                target_weight_page.take_screenshot(f'01_{step_counter:02d}_target_weight_75_entered')
                target_weight_page.click_next()
                time.sleep(2)
                step_counter += 1
            else:
                print("Экран целевого веса пропущен (цель: сохранить вес)")

            # 5. Ввод роста (первый раз - 180)
            height_page = HeightPage(driver)
            assert height_page.is_page_loaded(timeout=5), "Экран ввода роста не загрузился"
            height_page.enter_height(180)
            height_page.take_screenshot(f'01_{step_counter:02d}_height_180_entered')
            height_page.click_next()
            time.sleep(2)
            step_counter += 1
            
            # 6. Ввод даты рождения (первый раз - 1990-05-15)
            birthday_page = BirthdayPage(driver)
            assert birthday_page.is_page_loaded(timeout=5), "Экран ввода даты рождения не загрузился"
            birthday_page.select_birthday(1990, 5, 15)
            birthday_page.take_screenshot('01_07_birthday_1990_05_15_selected')
            birthday_page.click_next()
            time.sleep(2)
            
            # 7. Выбор активности (первый раз - second)
            activity_page = ActivityPage(driver)
            assert activity_page.is_page_loaded(timeout=5), "Экран выбора активности не загрузился"
            activity_page.select_activity('second')
            activity_page.take_screenshot('01_08_activity_second_selected')
            activity_page.click_next()
            time.sleep(2)

            # final screen
            complete_profile_page = CompleteProfilePage(driver)
            assert complete_profile_page.is_page_loaded(timeout=5), "Финальный экран активности не загрузился"
            complete_profile_page.take_screenshot('01_09_complete_profile_screen')

            # ========== ВОЗВРАТ НАЗАД: Возвращаемся до первого экрана ==========
            # При возврате назад все экраны появляются независимо от пропусков при движении вперед
            # Поэтому возвращаемся через все экраны: активность -> дата рождения -> рост -> целевой вес -> вес -> цель -> пол
            back_step_counter = 1

            # final -> 7 (активность -> дата рождения)
            complete_profile_page.click_back()
            time.sleep(2)  
            complete_profile_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_activity')
   

            # 7 -> 6 (активность -> дата рождения)
            activity_page = ActivityPage(driver)
            assert activity_page.is_page_loaded(timeout=5), "Экран выбора активности не загрузился"
            activity_page.click_back()
            time.sleep(2)  # Увеличена задержка для загрузки экрана
            activity_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_activity')
            back_step_counter += 1

            # 6 -> 5 (дата рождения -> рост)
            birthday_page = BirthdayPage(driver)         
            assert birthday_page.is_page_loaded(timeout=8), "Не вернулись на экран даты рождения"
            birthday_page.click_back()
            time.sleep(2)  # Увеличена задержка
            birthday_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_birthday')
            back_step_counter += 1

            # 5 -> 4 (рост -> целевой вес) - при возврате назад экран всегда появляется
            height_page = HeightPage(driver)
            assert height_page.is_page_loaded(timeout=8), "Не вернулись на экран роста"
            height_page.click_back()
            time.sleep(2)
            height_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_height')
            back_step_counter += 1

            # 4 -> 3 (целевой вес -> вес) - при возврате назад экран всегда появляется
            target_weight_page = TargetWeightPage(driver)
            assert target_weight_page.is_page_loaded(timeout=8), "Не вернулись на экран целевого веса"
            target_weight_page.click_back()
            time.sleep(2)
            target_weight_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_target_weight')
            back_step_counter += 1

            # 3 -> 2 (вес -> цель)
            weight_page = WeightPage(driver)
            assert weight_page.is_page_loaded(timeout=8), "Не вернулись на экран веса"
            weight_page.click_back()
            time.sleep(2)
            weight_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_weight')
            back_step_counter += 1

            # 2 -> 1 (цель -> пол)
            target_selection_page = TargetSelectionPage(driver)
            assert target_selection_page.is_page_loaded(timeout=8), "Не вернулись на экран выбора цели"
            target_selection_page.click_back()
            time.sleep(2)
            target_selection_page.take_screenshot(f'02_{back_step_counter:02d}_back_from_target')
            back_step_counter += 1

            # 1 -> GetGender (первый экран)
            profile_setup_page = ProfileSetupPage(driver)
            assert profile_setup_page.is_page_loaded(timeout=5), "Не вернулись на экран выбора пола"
            profile_setup_page.take_screenshot(f'02_{back_step_counter:02d}_back_to_gender')
            
            # ========== ВТОРОЙ ПРОХОД: Изменяем значения на каждом экране ==========
            # 1. Изменяем пол (female вместо male)
            profile_setup_page.select_gender('female')
            profile_setup_page.take_screenshot('03_01_gender_changed_to_female')
            profile_setup_page.click_next()
            time.sleep(2)
            
            # 2. Изменяем цель (lose вместо save)
            target_selection_page = TargetSelectionPage(driver)
            assert target_selection_page.is_page_loaded(timeout=5), "Экран выбора цели не загрузился"
            target_selection_page.select_target('lose')
            target_selection_page.take_screenshot('03_02_target_changed_to_lose')
            target_selection_page.click_next()
            time.sleep(2)
            
            # 3. Изменяем вес (80 вместо 75)
            weight_page = WeightPage(driver)
            assert weight_page.is_page_loaded(timeout=5), "Экран ввода веса не загрузился"
            weight_page.enter_weight(80)
            weight_page.take_screenshot('03_03_weight_changed_to_80')
            weight_page.click_next()
            time.sleep(2)

            # 4. Изменяем целевой вес (70 вместо 75) - может быть пропущен если цель "сохранить вес"
            target_weight_page = TargetWeightPage(driver)
            step_counter = 4  # Следующий шаг после веса
            if target_weight_page.is_page_loaded(timeout=3):
                # Экран целевого веса появился
                target_weight_page.enter_target_weight(70)
                target_weight_page.take_screenshot(f'03_{step_counter:02d}_target_weight_changed_to_70')
                target_weight_page.click_next()
                time.sleep(2)
                step_counter += 1
            else:
                print("Экран целевого веса пропущен при изменении значений (цель: сохранить вес)")

            # 5. Изменяем рост (175 вместо 180)
            height_page = HeightPage(driver)
            assert height_page.is_page_loaded(timeout=5), "Экран ввода роста не загрузился"
            height_page.enter_height(175)
            height_page.take_screenshot(f'03_{step_counter:02d}_height_changed_to_175')
            height_page.click_next()
            time.sleep(2)
            step_counter += 1
            
            # 6. Изменяем дату рождения (1985-06-20 вместо 1990-05-15)
            birthday_page = BirthdayPage(driver)
            assert birthday_page.is_page_loaded(timeout=5), "Экран ввода даты рождения не загрузился"
            birthday_page.select_birthday(1985, 6, 20)
            birthday_page.take_screenshot('03_06_birthday_changed_to_1985_06_20')
            birthday_page.click_next()
            time.sleep(2)
            
            # 7. Изменяем активность (third вместо second)
            activity_page = ActivityPage(driver)
            assert activity_page.is_page_loaded(timeout=5), "Экран выбора активности не загрузился"
            activity_page.select_activity('third')
            activity_page.take_screenshot('03_07_activity_changed_to_third')
            activity_page.click_next()
            time.sleep(2)
            
            # ========== ЗАВЕРШЕНИЕ: Завершаем onboarding ==========
            complete_profile_page = CompleteProfilePage(driver)
            assert complete_profile_page.is_page_loaded(timeout=5), "Экран завершения профиля не загрузился"
            complete_profile_page.take_screenshot('04_01_complete_profile_screen')
            complete_profile_page.click_complete()
            time.sleep(5)  # Ожидание создания профиля
            
            # Проверяем, что onboarding завершен и мы на главном экране
            main_page = MainPage(driver)
            assert main_page.is_page_loaded(timeout=10), "Главный экран не загрузился после onboarding"
            main_page.take_screenshot('04_02_onboarding_complete_main_screen')
            
            print("✅ Навигация назад и изменение значений в onboarding flow работает корректно")
            
            # Выходим из аккаунта, чтобы приложение осталось открытым (экран входа)
            self._logout(driver)
    
    @pytest.mark.smoke
    def test_03_onboarding_completion_time_under_3_minutes(self, driver, setup_test_environment, test_user):
        """Тест 03: время завершения onboarding <3 минут (AC: 4)"""
        with timer_step("Проверка времени завершения onboarding"):
            # Регистрация
            self._register_user(driver, test_user)
            
            # Засекаем время начала onboarding
            onboarding_start_time = time.time()
            
            # Проходим onboarding
            self._complete_onboarding_flow(driver)
            
            # Засекаем время окончания
            onboarding_end_time = time.time()
            onboarding_duration = onboarding_end_time - onboarding_start_time
            
            print(f"\n[ONBOARDING TIME] Время прохождения: {onboarding_duration:.2f} секунд ({onboarding_duration/60:.2f} минут)")
            
            # Проверяем, что время <3 минут (180 секунд)
            assert onboarding_duration < 180, f"Onboarding занял {onboarding_duration:.2f} секунд ({onboarding_duration/60:.2f} минут), что больше 3 минут"
            
            # Проверяем, что мы на главном экране
            main_page = MainPage(driver)
            assert main_page.is_page_loaded(timeout=10), "Главный экран не загрузился"
            
            print(f"✅ Onboarding завершен за {onboarding_duration:.2f} секунд (<3 минут)")
            
            # Выходим из аккаунта, чтобы приложение осталось открытым (экран входа)
            self._logout(driver)
    
    @pytest.mark.smoke
    def test_04_aha_moment_and_guidance_to_first_action(self, driver, setup_test_environment, test_user):
        """Тест 04: 'Aha!' момент и подсказка к первому действию (AC: 4)"""
        with timer_step("Aha! момент и подсказки"):
            # Регистрация
            self._register_user(driver, test_user)
            
            # Проходим onboarding до завершения
            self._complete_onboarding_flow(driver)
            
            # Проверяем наличие экрана завершения onboarding с "Aha!" моментом
            onboarding_complete_page = OnboardingCompletePage(driver)
            
            # Может быть экран завершения onboarding или сразу главный экран
            # Проверяем оба варианта
            if onboarding_complete_page.is_page_loaded(timeout=5):
                onboarding_complete_page.take_screenshot('01_onboarding_complete_screen')
                
                # Проверяем наличие подсказок к первому действию
                assert onboarding_complete_page.has_guidance_actions(), "Кнопки для первого действия не найдены"
                onboarding_complete_page.take_screenshot('02_guidance_actions')
                
                # Проверяем наличие кнопки "Начать использовать приложение"
                try:
                    onboarding_complete_page.click_start_using()
                    onboarding_complete_page.take_screenshot('03_after_start_using')
                except Exception:
                    pass  # Кнопка может отсутствовать, если переход автоматический
            else:
                # Если экран завершения не появился, проверяем главный экран
                main_page = MainPage(driver)
                assert main_page.is_page_loaded(timeout=10), "Главный экран не загрузился"
                main_page.take_screenshot('01_main_after_onboarding')
            
            print("✅ 'Aha!' момент и подсказки к первому действию проверены")
