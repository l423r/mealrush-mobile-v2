"""
Тесты для управления аккаунтом (Account Management)
"""
import os
import sys
import pytest
import time
from contextlib import contextmanager

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pages.account_page import AccountPage
from pages.delete_account_page import DeleteAccountPage
from pages.settings_page import SettingsPage
from pages.profile_page import ProfilePage
from pages.main_page import MainPage
from pages.sign_in_page import SignInPage
from pages.registration_page import RegistrationPage
from pages.profile_setup_page import ProfileSetupPage
from pages.target_selection_page import TargetSelectionPage
from pages.weight_page import WeightPage
from pages.height_page import HeightPage
from pages.birthday_page import BirthdayPage
from pages.activity_page import ActivityPage
from pages.complete_profile_page import CompleteProfilePage


@contextmanager
def time_logger(operation_name):
    """Контекстный менеджер для логирования времени выполнения операций"""
    start_time = time.time()
    print(f"[TIMING] Начало: {operation_name}")
    try:
        yield
    finally:
        elapsed = time.time() - start_time
        if elapsed > 0.5:
            print(f"[TIMING] Завершено: {operation_name} - {elapsed:.2f}с")
        else:
            print(f"[TIMING] Завершено: {operation_name} - {elapsed:.2f}с (быстро)")


@pytest.mark.integration
class TestAccount:
    """Тесты для управления аккаунтом"""
    
    # Сохраняем данные пользователя из первого теста для повторного использования
    _shared_user = None
    
    def _logout(self, driver):
        """Выполняет выход из аккаунта"""
        sign_in_page = SignInPage(driver)
        main_page = MainPage(driver)
        profile_page = ProfilePage(driver)
        account_page = AccountPage(driver)
        settings_page = SettingsPage(driver)
        
        try:
            # Если мы на экране аккаунта, возвращаемся назад
            if account_page.is_page_loaded(timeout=1):
                print("[_logout] Возвращаемся из экрана аккаунта...")
                driver.back()
                time.sleep(1)
            
            # Если мы в настройках, возвращаемся в профиль
            if settings_page.is_page_loaded(timeout=1):
                print("[_logout] Возвращаемся из настроек в профиль...")
                driver.back()
                time.sleep(1)
            
            # Переходим в профиль, если мы не там
            if not profile_page.is_page_loaded(timeout=2):
                if main_page.is_page_loaded(timeout=2):
                    print("[_logout] Переходим в профиль...")
                    main_page.navigate_to_profile()
                    time.sleep(1)
            
            # Выполняем выход из профиля
            if profile_page.is_page_loaded(timeout=2):
                print("[_logout] Выполняем выход из аккаунта...")
                profile_page.scroll_to_logout()
                time.sleep(0.5)
                profile_page.click_logout()
                time.sleep(2)
                
                if sign_in_page.is_page_loaded(timeout=3):
                    print("[_logout] ✓ Успешно вышли из аккаунта")
                    return True
        except Exception as e:
            print(f"Warning: Could not logout through UI: {e}")
        
        return False
    
    def _register_user(self, driver, user_data):
        """Регистрирует пользователя"""
        with time_logger("Регистрация пользователя"):
            sign_in_page = SignInPage(driver)
            with time_logger("Проверка страницы входа"):
                if not sign_in_page.is_page_loaded(timeout=3):
                    # Пытаемся вернуться на страницу входа
                    for _ in range(5):
                        driver.back()
                        time.sleep(0.5)
                        if sign_in_page.is_page_loaded_fast(timeout=1):
                            break
            
            with time_logger("Клик на регистрацию и заполнение формы"):
                registration_page = sign_in_page.click_register_button()
                registration_page.register(
                    user_data['name'],
                    user_data['email'],
                    user_data['password']
                )
            
            with time_logger("Ожидание завершения регистрации"):
                time.sleep(4)  # Ожидание завершения регистрации
            return registration_page
    
    def _create_full_profile(self, driver):
        """Создает полный профиль, проходя через все экраны настройки"""
        with time_logger("Создание полного профиля"):
            with time_logger("Ожидание загрузки страницы настройки профиля"):
                profile_setup_page = ProfileSetupPage(driver)
                if not profile_setup_page.is_page_loaded(timeout=5):
                    return False
            
            # Выбор пола
            with time_logger("Выбор пола"):
                profile_setup_page.select_gender('male')
                profile_setup_page.click_next()
                time.sleep(2)
            
            # Выбор цели
            with time_logger("Выбор цели"):
                target_selection_page = TargetSelectionPage(driver)
                if target_selection_page.is_page_loaded(timeout=3):
                    target_selection_page.select_target('save')
                    target_selection_page.click_next()
                    time.sleep(2)
            
            # Ввод веса
            with time_logger("Ввод веса"):
                weight_page = WeightPage(driver)
                if weight_page.is_page_loaded(timeout=3):
                    weight_page.enter_weight(75)
                    weight_page.click_next()
                    time.sleep(2)
            
            # Ввод роста
            with time_logger("Ввод роста"):
                height_page = HeightPage(driver)
                if height_page.is_page_loaded(timeout=3):
                    height_page.enter_height(175)
                    height_page.click_next()
                    time.sleep(1)
            
            # Выбор даты рождения
            with time_logger("Выбор даты рождения"):
                birthday_page = BirthdayPage(driver)
                if birthday_page.is_page_loaded(timeout=3):
                    birthday_page.select_date()
                    birthday_page.click_next()
                    time.sleep(2)
            
            # Выбор уровня активности
            with time_logger("Выбор уровня активности"):
                activity_page = ActivityPage(driver)
                if activity_page.is_page_loaded(timeout=3):
                    activity_page.select_activity('second')
                    activity_page.click_next()
                    time.sleep(2)
            
            # Завершение настройки профиля
            with time_logger("Завершение настройки профиля"):
                complete_profile_page = CompleteProfilePage(driver)
                if complete_profile_page.is_page_loaded(timeout=3):
                    complete_profile_page.click_complete()
                    time.sleep(3)  # Ожидание завершения создания профиля
            
            return True
    
    @pytest.fixture(autouse=True)
    def navigate_to_settings(self, driver, test_user, request):
        """Фикстура для автоматической регистрации, создания профиля и перехода в настройки"""
        # Пропускаем навигацию для тестов удаления, так как они создают своих пользователей
        test_name = request.node.name
        if 'delete' in test_name.lower() or 'deletion' in test_name.lower():
            print(f"[navigate_to_settings] Пропускаем навигацию для теста {test_name} (тест удаления)")
            yield
            return
        
        with time_logger("navigate_to_settings (вся фикстура)"):
            # Даем время для загрузки начального экрана
            with time_logger("Ожидание загрузки начального экрана"):
                print("[navigate_to_settings] Ожидание загрузки начального экрана...")
                time.sleep(2)
            
            sign_in_page = SignInPage(driver)
            profile_page = ProfilePage(driver)
            settings_page = SettingsPage(driver)
            main_page = MainPage(driver)
            
            # Проверка: если на странице входа - регистрируем/логинимся, иначе уже залогинен
            with time_logger("Проверка текущей страницы"):
                print("[navigate_to_settings] Проверяем, на какой странице находимся...")
                is_on_sign_in = sign_in_page.is_page_loaded(timeout=5)
                print(f"[navigate_to_settings] На странице входа: {is_on_sign_in}")
            
            if is_on_sign_in:
                # На странице входа
                if TestAccount._shared_user is None:
                    # Первый тест - регистрируем нового пользователя
                    TestAccount._shared_user = test_user
                    self._register_user(driver, test_user)
                    
                    # Создаем полный профиль
                    with time_logger("Ожидание загрузки страницы настройки профиля"):
                        profile_setup_page = ProfileSetupPage(driver)
                        if profile_setup_page.is_page_loaded(timeout=5):
                            self._create_full_profile(driver)
                    
                    # Переходим в профиль, затем в настройки
                    with time_logger("Переход в профиль после регистрации"):
                        if main_page.is_page_loaded(timeout=3):
                            main_page.navigate_to_profile()
                            time.sleep(2)
                            
                            # Переходим в настройки
                            if profile_page.is_page_loaded(timeout=3):
                                profile_page.click_settings()
                                time.sleep(2)
                else:
                    # Последующие тесты - логинимся с сохраненными данными
                    with time_logger("Логин существующего пользователя"):
                        sign_in_page.login(
                            TestAccount._shared_user['email'],
                            TestAccount._shared_user['password']
                        )
                        time.sleep(4)
                    
                    # Переходим в профиль, затем в настройки
                    with time_logger("Переход в профиль после логина"):
                        if main_page.is_page_loaded(timeout=3):
                            main_page.navigate_to_profile()
                            time.sleep(2)
                            
                            # Переходим в настройки
                            if profile_page.is_page_loaded(timeout=3):
                                profile_page.click_settings()
                                time.sleep(2)
            else:
                # Пользователь уже залогинен - проверяем, где мы находимся
                print("[navigate_to_settings] Пользователь уже залогинен, проверяем текущую страницу...")
                
                # Проверяем, не на странице профиля ли уже
                if profile_page.is_page_loaded(timeout=3):
                    print("[navigate_to_settings] На странице профиля, переходим в настройки...")
                    profile_page.click_settings()
                    time.sleep(2)
                elif main_page.is_page_loaded(timeout=3):
                    print("[navigate_to_settings] На главной странице, переходим в профиль, затем в настройки...")
                    main_page.navigate_to_profile()
                    time.sleep(2)
                    if profile_page.is_page_loaded(timeout=3):
                        profile_page.click_settings()
                        time.sleep(2)
                elif settings_page.is_page_loaded(timeout=3):
                    print("[navigate_to_settings] Уже на странице настроек")
                else:
                    print("[navigate_to_settings] Неизвестная страница, пытаемся перейти в настройки...")
                    try:
                        # Пытаемся вернуться на главную и перейти в профиль
                        for _ in range(3):
                            driver.back()
                            time.sleep(1)
                            if main_page.is_page_loaded(timeout=2):
                                main_page.navigate_to_profile()
                                time.sleep(2)
                                if profile_page.is_page_loaded(timeout=2):
                                    profile_page.click_settings()
                                    time.sleep(2)
                                    break
                    except Exception as e:
                        print(f"[navigate_to_settings] Ошибка при навигации: {e}")
            
            # Проверяем, что мы в настройках
            with time_logger("Проверка загрузки страницы настроек"):
                print("[navigate_to_settings] Ожидание загрузки страницы настроек...")
                time.sleep(2)
            
            yield
            
            # Cleanup: выход из аккаунта после каждого теста
            # Это нужно, чтобы следующий тест мог начать с чистого листа
            try:
                print("[navigate_to_settings] Cleanup: выход из аккаунта после теста...")
                sign_in_page = SignInPage(driver)
                
                # Если мы не на странице входа, выходим из аккаунта
                if not sign_in_page.is_page_loaded(timeout=2):
                    # Возвращаемся из экрана аккаунта, если мы там
                    account_page = AccountPage(driver)
                    if account_page.is_page_loaded(timeout=1):
                        print("[navigate_to_settings] Возвращаемся из экрана аккаунта...")
                        driver.back()
                        time.sleep(1)
                    
                    # Выходим из аккаунта
                    self._logout(driver)
                    time.sleep(2)
                    
                    # Проверяем, что мы на странице входа
                    if sign_in_page.is_page_loaded(timeout=3):
                        print("[navigate_to_settings] ✓ Успешно вышли из аккаунта")
                    else:
                        print("[navigate_to_settings] ⚠ Не удалось подтвердить выход из аккаунта")
                else:
                    print("[navigate_to_settings] Уже на странице входа, выход не требуется")
            except Exception as e:
                print(f"Warning: Could not logout after test: {e}")
    
    def test_01_view_account_information(self, driver, setup_test_environment):
        """Тест: пользователь может просмотреть информацию об аккаунте (AC: 1)"""
        print("\n[test_01] ===== Начало теста: просмотр информации об аккаунте =====")
        
        settings_page = SettingsPage(driver)
        account_page = AccountPage(driver)
        
        print("[test_01] Шаг 1: Проверяем загрузку страницы настроек...")
        assert settings_page.is_page_loaded(), "Страница настроек не загрузилась"
        settings_page.take_screenshot('01_settings_page')
        
        print("[test_01] Шаг 2: Переходим на экран аккаунта...")
        with time_logger("Переход на экран аккаунта"):
            settings_page.click_account()
            time.sleep(2)
        
        print("[test_01] Шаг 3: Проверяем загрузку страницы аккаунта...")
        assert account_page.is_page_loaded(), "Страница аккаунта не загрузилась"
        account_page.take_screenshot('02_account_page')
        
        # Ждем загрузки данных (если есть состояние загрузки)
        print("[test_01] Шаг 4: Ожидаем загрузки данных...")
        max_wait = 10
        for _ in range(max_wait):
            if not account_page.is_loading():
                break
            time.sleep(1)
        
        print("[test_01] Шаг 5: Проверяем отображение email...")
        email = account_page.get_email()
        print(f"[test_01] Email: {email}")
        assert email is not None, "Email должен быть отображен"
        assert '@' in email, "Email должен содержать символ @"
        account_page.take_screenshot('03_account_with_email')
        
        print("[test_01] Шаг 6: Проверяем отображение даты создания...")
        created_at = account_page.get_created_at()
        print(f"[test_01] Дата создания: {created_at}")
        assert created_at is not None, "Дата создания должна быть отображена"
        account_page.take_screenshot('04_account_with_date')
        
        print("[test_01] Шаг 7: Проверяем секцию OAuth провайдеров...")
        has_oauth_section = account_page.has_oauth_providers() or account_page.is_displayed_multiple(
            account_page.EMPTY_OAUTH_TEXT, timeout=2
        )
        assert has_oauth_section, "Секция OAuth провайдеров должна быть отображена"
        account_page.take_screenshot('05_account_with_oauth')
        
        print("[test_01] ===== Тест завершен успешно =====\n")
    
    def test_02_delete_account_with_confirmation(self, driver, setup_test_environment):
        """Тест: пользователь может удалить аккаунт с подтверждением (AC: 4)"""
        print("\n[test_02] ===== Начало теста: удаление аккаунта с подтверждением =====")
        
        # Создаем отдельного пользователя для теста удаления
        import random
        import string
        random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
        test_email = f"delete_test_{random_string}@example.com"
        test_password = "Test123456"
        test_name = "Delete Test User"
        
        sign_in_page = SignInPage(driver)
        settings_page = SettingsPage(driver)
        delete_account_page = DeleteAccountPage(driver)
        
        print("[test_02] Шаг 1: Регистрируем тестового пользователя...")
        with time_logger("Регистрация пользователя"):
            # Проверяем, на какой странице мы находимся
            if not sign_in_page.is_page_loaded(timeout=2):
                # Возвращаемся на страницу входа
                print("[test_02] Возвращаемся на страницу входа...")
                for _ in range(5):
                    driver.back()
                    time.sleep(0.5)
                    if sign_in_page.is_page_loaded(timeout=2):
                        break
            else:
                print("[test_02] Уже на странице входа")
            
            registration_page = sign_in_page.click_register_button()
            registration_page.register(test_name, test_email, test_password)
            time.sleep(4)  # Ожидание завершения регистрации
            
            # Создаем полный профиль, если нужно
            profile_setup_page = ProfileSetupPage(driver)
            if profile_setup_page.is_page_loaded(timeout=5):
                print("[test_02] Создаем профиль...")
                self._create_full_profile(driver)
                time.sleep(2)
        
        print("[test_02] Шаг 2: Переходим в настройки...")
        main_page = MainPage(driver)
        profile_page = ProfilePage(driver)
        
        if main_page.is_page_loaded(timeout=3):
            main_page.navigate_to_profile()
            time.sleep(2)
        
        if profile_page.is_page_loaded(timeout=3):
            profile_page.click_settings()
            time.sleep(2)
        
        assert settings_page.is_page_loaded(), "Страница настроек не загрузилась"
        settings_page.take_screenshot('01_settings_before_delete')
        
        print("[test_02] Шаг 3: Переходим на экран удаления аккаунта...")
        with time_logger("Переход на экран удаления"):
            settings_page.click_delete_account()
            time.sleep(2)
        
        print("[test_02] Шаг 4: Проверяем загрузку страницы удаления аккаунта...")
        assert delete_account_page.is_page_loaded(), "Страница удаления аккаунта не загрузилась"
        delete_account_page.take_screenshot('02_delete_account_page')
        
        print("[test_02] Шаг 5: Проверяем наличие предупреждения...")
        assert delete_account_page.has_warning(), "Предупреждение о необратимости должно быть отображено"
        delete_account_page.take_screenshot('03_warning_visible')
        
        print("[test_02] Шаг 6: Кликаем на кнопку удаления аккаунта...")
        delete_account_page.click_delete_account()
        time.sleep(1)
        delete_account_page.take_screenshot('04_first_confirm_dialog')
        
        print("[test_02] Шаг 7: Подтверждаем удаление в первом диалоге...")
        assert delete_account_page.is_confirm_dialog_visible(), "Первый диалог подтверждения должен быть виден"
        delete_account_page.confirm_deletion()
        time.sleep(2)  # Увеличена задержка для появления второго диалога
        delete_account_page.take_screenshot('05_second_confirm_dialog')
        
        print("[test_02] Шаг 8: Подтверждаем удаление во втором диалоге...")
        assert delete_account_page.is_second_confirm_dialog_visible(), "Второй диалог подтверждения должен быть виден"
        with time_logger("Подтверждение удаления"):
            delete_account_page.confirm_second_deletion()
            time.sleep(3)  # Ожидание выполнения удаления
        
        print("[test_02] Шаг 9: Проверяем, что пользователь разлогинен...")
        # После удаления аккаунта пользователь должен быть разлогинен
        # и перенаправлен на страницу входа
        sign_in_page = SignInPage(driver)
        sign_in_page.take_screenshot('06_sign_in_after_deletion')
        
        # Ждем немного для завершения процесса удаления
        time.sleep(2)
        
        is_on_sign_in = sign_in_page.is_page_loaded(timeout=5)
        print(f"[test_02] Пользователь на странице входа: {is_on_sign_in}")
        assert is_on_sign_in, "После удаления аккаунта пользователь должен быть разлогинен и перенаправлен на страницу входа"
        
        print("[test_02] ===== Тест завершен успешно =====\n")

