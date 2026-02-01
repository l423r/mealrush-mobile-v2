"""
Pytest configuration and fixtures
"""
import pytest
import os
import sys
import time
from datetime import datetime
from dotenv import load_dotenv

# Добавляем текущую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Импортируем таймер для профилирования
from utilities.timing import timer

# Загружаем переменные окружения из файла
env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.env')
if os.path.exists(env_file):
    load_dotenv(env_file)

from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions
from config.appium_config import APPIUM_SERVER_URL, ANDROID_CAPABILITIES, IOS_CAPABILITIES, TEST_TIMEOUT, SCREENSHOT_DIR
import subprocess

# Создаем папку для текущей сессии тестов с временной меткой
SESSION_TIMESTAMP = datetime.now().strftime('%Y%m%d_%H%M%S')
SESSION_SCREENSHOT_DIR = os.path.join(SCREENSHOT_DIR, f"test_session_{SESSION_TIMESTAMP}")
os.makedirs(SESSION_SCREENSHOT_DIR, exist_ok=True)
print(f"Test session screenshots will be saved to: {SESSION_SCREENSHOT_DIR}")


def _delete_account_via_ui(driver, email):
    """
    Удаляет аккаунт пользователя через интерфейс приложения.
    
    Путь: MainScreen -> Profile tab -> Settings -> Delete Account -> Confirm
    
    После удаления аккаунта приложение автоматически очистит токены и перейдет на экран логина.
    
    Args:
        driver: Appium WebDriver instance
        email: Email пользователя для логирования (не используется для удаления)
    
    Returns:
        bool: True если удаление успешно, False в противном случае
    """
    try:
        print(f"[CLEANUP] [UI] Начинаем удаление аккаунта через интерфейс приложения (email: {email})")
        
        from pages.main_page import MainPage
        from pages.profile_page import ProfilePage
        from pages.settings_page import SettingsPage
        from pages.delete_account_page import DeleteAccountPage
        from pages.sign_in_page import SignInPage
        
        # Проверяем, не находимся ли мы уже на экране логина (токены могли истечь)
        sign_in_page = SignInPage(driver)
        if sign_in_page.is_page_loaded(timeout=2):
            print("[CLEANUP] [UI] Пользователь уже на экране логина (токены истекли или пользователь не залогинен)")
            print("[CLEANUP] [UI] Пропускаем удаление через UI - пользователь уже разлогинен")
            return True  # Считаем успешным, так как пользователь уже разлогинен
        
        main_page = MainPage(driver)
        
        # 1. Переходим на вкладку Profile (bottom navigation)
        print("[CLEANUP] [UI] Шаг 1: Переход на вкладку Profile...")
        try:
            main_page.navigate_to_profile()
            time.sleep(2)
        except Exception as e:
            print(f"[CLEANUP] [UI] ⚠ Ошибка при переходе на Profile: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        # 2. Открываем Settings
        print("[CLEANUP] [UI] Шаг 2: Открываем Settings...")
        profile_page = ProfilePage(driver)
        if not profile_page.is_page_loaded(timeout=5):
            print("[CLEANUP] [UI] ⚠ Страница Profile не загрузилась")
            return False
        
        profile_page.click_settings()
        time.sleep(1)
        
        # 3. Открываем Delete Account прямо из Settings
        print("[CLEANUP] [UI] Шаг 3: Открываем Delete Account из Settings...")
        settings_page = SettingsPage(driver)
        if not settings_page.is_page_loaded(timeout=5):
            print("[CLEANUP] [UI] ⚠ Страница Settings не загрузилась")
            return False
        
        settings_page.click_delete_account()
        time.sleep(1)
        
        # 4. Подтверждаем удаление
        print("[CLEANUP] [UI] Шаг 4: Подтверждаем удаление аккаунта...")
        delete_account_page = DeleteAccountPage(driver)
        if not delete_account_page.is_page_loaded(timeout=5):
            print("[CLEANUP] [UI] ⚠ Страница Delete Account не загрузилась")
            return False
        
        # Кликаем на кнопку удаления
        print("[CLEANUP] [UI] Кликаем на кнопку удаления аккаунта...")
        delete_account_page.click_delete_account()
        time.sleep(1)
        
        # Подтверждаем в первом диалоге
        print("[CLEANUP] [UI] Проверяем первый диалог подтверждения...")
        if not delete_account_page.is_confirm_dialog_visible():
            print("[CLEANUP] [UI] ⚠ Первый диалог подтверждения не появился")
            return False
        
        print("[CLEANUP] [UI] Подтверждаем удаление в первом диалоге...")
        delete_account_page.confirm_deletion()
        time.sleep(2)  # Ожидание появления второго диалога
        
        # Подтверждаем во втором диалоге (обязательно)
        print("[CLEANUP] [UI] Проверяем второй диалог подтверждения...")
        # Ждем появления второго диалога с повторными попытками
        second_dialog_visible = False
        for attempt in range(3):
            if delete_account_page.is_second_confirm_dialog_visible():
                second_dialog_visible = True
                break
            print(f"[CLEANUP] [UI] Попытка {attempt + 1}/3: второй диалог еще не появился, ждем...")
            time.sleep(1)
        
        if not second_dialog_visible:
            print("[CLEANUP] [UI] ⚠ Второй диалог подтверждения не появился после ожидания")
            print("[CLEANUP] [UI] Возможно, удаление уже выполнено или произошла ошибка")
            # Продолжаем, так как удаление могло пройти без второго диалога
        else:
            print("[CLEANUP] [UI] Второй диалог найден, подтверждаем удаление...")
            delete_account_page.confirm_second_deletion()
            time.sleep(3)  # Увеличена задержка для выполнения удаления
        
        # Ждем перехода на экран логина
        print("[CLEANUP] [UI] Шаг 5: Ожидание перехода на экран логина...")
        
        # Ждем до 10 секунд появления экрана логина
        if sign_in_page.is_page_loaded(timeout=10):
            print("[CLEANUP] [UI] ✓ Аккаунт удален, приложение на экране логина")
            return True
        else:
            print("[CLEANUP] [UI] ⚠ Экран логина не появился, но удаление могло пройти успешно")
            return True  # Считаем успешным, так как удаление могло пройти
        
    except Exception as e:
        print(f"[CLEANUP] [UI] ✗ Ошибка при удалении аккаунта через UI: {e}")
        import traceback
        traceback.print_exc()
        return False


@pytest.fixture(scope='session')
def driver():
    """Создает и возвращает Appium driver"""
    # Определяем платформу
    platform = os.getenv('PLATFORM', 'android').lower()
    
    # Выбираем capabilities в зависимости от платформы
    if platform == 'android':
        options = UiAutomator2Options()
        options.platform_name = ANDROID_CAPABILITIES['platformName']
        options.platform_version = ANDROID_CAPABILITIES['platformVersion']
        options.device_name = ANDROID_CAPABILITIES['deviceName']
        options.app = ANDROID_CAPABILITIES['app']
        options.app_package = ANDROID_CAPABILITIES['appPackage']
        options.app_activity = ANDROID_CAPABILITIES['appActivity']
        options.automation_name = ANDROID_CAPABILITIES['automationName']
        options.no_reset = ANDROID_CAPABILITIES['noReset']
        options.full_reset = ANDROID_CAPABILITIES['fullReset']
        options.new_command_timeout = ANDROID_CAPABILITIES['newCommandTimeout']
        options.auto_grant_permissions = ANDROID_CAPABILITIES['autoGrantPermissions']
        options.unicode_keyboard = ANDROID_CAPABILITIES['unicodeKeyboard']
        options.reset_keyboard = ANDROID_CAPABILITIES['resetKeyboard']
    elif platform == 'ios':
        options = XCUITestOptions()
        options.platform_name = IOS_CAPABILITIES['platformName']
        options.platform_version = IOS_CAPABILITIES['platformVersion']
        options.device_name = IOS_CAPABILITIES['deviceName']
        options.app = IOS_CAPABILITIES['app']
        options.automation_name = IOS_CAPABILITIES['automationName']
        options.no_reset = IOS_CAPABILITIES['noReset']
        options.full_reset = IOS_CAPABILITIES['fullReset']
        options.new_command_timeout = IOS_CAPABILITIES['newCommandTimeout']
    else:
        raise ValueError(f"Unsupported platform: {platform}")
    
    # Создаем driver с Options
    driver = webdriver.Remote(APPIUM_SERVER_URL, options=options)
    
    # Устанавливаем таймауты
    driver.implicitly_wait(10)
    
    yield driver
    
    # Закрываем driver после всех тестов
    driver.quit()


@pytest.fixture(scope='function')
def setup_test_environment(driver, request):
    """Настройка окружения для каждого теста"""
    # Получаем имя теста для создания подпапки
    test_name = request.node.name
    # Очищаем имя теста от недопустимых символов для имени папки
    test_name_clean = "".join(c for c in test_name if c.isalnum() or c in ('_', '-')).rstrip()
    
    # Создаем подпапку для текущего теста
    test_screenshot_dir = os.path.join(SESSION_SCREENSHOT_DIR, test_name_clean)
    os.makedirs(test_screenshot_dir, exist_ok=True)
    
    # Сбрасываем счетчик скриншотов для этого теста
    from utilities.base_page import BasePage
    BasePage._screenshot_counter[test_screenshot_dir] = 0
    
    # Устанавливаем директорию теста в thread-local storage
    BasePage.set_test_dir(test_screenshot_dir)
    
    # Сохраняем путь к директории теста в request для доступа из тестов
    request.node.test_screenshot_dir = test_screenshot_dir
    
    # Устанавливаем текущий тест для профилирования
    timer.set_current_test(test_name)
    test_start_time = time.perf_counter()
    
    # Делаем скриншот начала теста
    base_page = BasePage(driver)
    base_page.take_screenshot('test_start')
    
    yield
    
    # Делаем скриншот конца теста (с обработкой ошибок, так как приложение могло упасть)
    try:
        base_page.take_screenshot('test_end')
    except Exception as e:
        print(f"Warning: Could not take end screenshot for test {test_name}: {e}")
        # Не прерываем выполнение из-за ошибки скриншота
    
    # Выводим сводку времени для теста
    test_duration = (time.perf_counter() - test_start_time) * 1000
    timer.print_test_summary(test_name)
    print(f"[TIMING] ⏱ Общее время теста '{test_name}': {test_duration:.0f}ms ({test_duration/1000:.1f}s)")
    
    # ВАЖНО: Cleanup пользователей НЕ происходит здесь!
    # Пользователи удаляются в конце СЕССИИ через session_cleanup фикстуру
    # Это позволяет использовать одного пользователя для всех тестов модуля
    
    # Очищаем thread-local storage после теста
    BasePage.set_test_dir(None)
    timer.set_current_test(None)


# Глобальная переменная для хранения driver между фикстурами
_session_driver = None


@pytest.fixture(scope='session', autouse=True)
def session_cleanup(driver):
    """
    Фикстура уровня сессии для cleanup пользователей.
    
    Выполняется автоматически в конце всей тестовой сессии.
    Удаляет всех зарегистрированных тестовых пользователей через UI.
    """
    global _session_driver
    _session_driver = driver
    
    yield
    
    # Cleanup в конце всей сессии
    print("\n" + "="*60)
    print("SESSION CLEANUP: Удаление тестовых пользователей")
    print("="*60)
    
    try:
        from utilities.user_cleanup import UserCleanup
        registered_users = UserCleanup.get_registered_users()
        
        if registered_users:
            print(f"[SESSION CLEANUP] Найдено {len(registered_users)} пользователей для удаления")
            
            # Удаляем каждого пользователя через UI
            # Копируем список, так как будем модифицировать его в цикле
            emails_to_delete = registered_users.copy() if hasattr(registered_users, 'copy') else list(registered_users)
            for email in emails_to_delete:
                password = UserCleanup.get_user_password(email)
                if password:
                    print(f"[SESSION CLEANUP] Удаление аккаунта {email} через UI...")
                    success = _delete_account_via_ui(driver, email)
                    if success:
                        print(f"[SESSION CLEANUP] ✓ Аккаунт {email} удален через UI")
                        UserCleanup.unregister_user(email)
                    else:
                        print(f"[SESSION CLEANUP] ⚠ Не удалось удалить через UI, пробуем API...")
                        # Fallback: если UI не сработал, используем API
                        try:
                            UserCleanup.delete_user_profile(email, password)
                            UserCleanup.unregister_user(email)
                            print(f"[SESSION CLEANUP] ✓ Аккаунт {email} удален через API")
                        except Exception as api_error:
                            print(f"[SESSION CLEANUP] ⚠ Ошибка при удалении через API: {api_error}")
                else:
                    print(f"[SESSION CLEANUP] ⚠ Пароль не найден для {email}, пропускаем")
        else:
            print("[SESSION CLEANUP] Нет зарегистрированных пользователей для удаления")
            
    except Exception as e:
        print(f"[SESSION CLEANUP] ⚠ Ошибка при cleanup: {e}")
        import traceback
        traceback.print_exc()
    
    print("="*60)
    
    # Выводим общую статистику профилирования
    timer.print_summary(min_total_ms=100)


@pytest.fixture(scope='function')
def test_user():
    """Возвращает тестового пользователя"""
    import random
    import string
    import time
    
    # Генерируем уникальные данные для теста
    # Используем timestamp для гарантированной уникальности
    timestamp = int(time.time() * 1000)  # миллисекунды
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    # Комбинируем timestamp и случайную строку для максимальной уникальности
    unique_id = f"{timestamp}_{random_string}"
    email = f"test_{unique_id}@example.com"
    password = "Test123456"
    name = f"Test User {random_string}"
    
    return {
        'email': email,
        'password': password,
        'name': name
    }


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Делает скриншот при падении теста"""
    outcome = yield
    rep = outcome.get_result()
    
    # Если тест упал, делаем скриншот
    if rep.when == "call" and rep.failed:
        try:
            # Получаем driver из фикстуры
            driver = item.funcargs.get('driver')
            if driver:
                # Получаем директорию теста из атрибута
                test_screenshot_dir = getattr(item, 'test_screenshot_dir', SESSION_SCREENSHOT_DIR)
                from utilities.base_page import BasePage
                base_page = BasePage(driver)
                base_page.take_screenshot('test_failure', test_dir=test_screenshot_dir)
        except Exception as e:
            print(f"Failed to take screenshot: {e}")


# Pytest configuration
def pytest_addoption(parser):
    """Добавление кастомных опций командной строки"""
    parser.addoption(
        "--stop-on-first-failure",
        action="store_true",
        default=False,
        help="Остановить выполнение тестов при первом падении (аналог -x/--exitfirst)"
    )
    parser.addoption(
        "--continue-on-failure",
        action="store_true",
        default=False,
        help="Продолжить выполнение тестов даже при падениях (по умолчанию)"
    )


def pytest_configure(config):
    """Конфигурация pytest"""
    config.addinivalue_line(
        "markers", "smoke: marks tests as smoke tests"
    )
    config.addinivalue_line(
        "markers", "regression: marks tests as regression tests"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    
    # Автоматически применяем --exitfirst если указан --stop-on-first-failure
    if config.getoption("--stop-on-first-failure"):
        config.option.exitfirst = True

