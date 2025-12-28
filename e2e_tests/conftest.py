"""
Pytest configuration and fixtures
"""
import pytest
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Добавляем текущую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Загружаем переменные окружения из файла
env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.env')
if os.path.exists(env_file):
    load_dotenv(env_file)

from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions
from config.appium_config import APPIUM_SERVER_URL, ANDROID_CAPABILITIES, IOS_CAPABILITIES, TEST_TIMEOUT, SCREENSHOT_DIR

# Создаем папку для текущей сессии тестов с временной меткой
SESSION_TIMESTAMP = datetime.now().strftime('%Y%m%d_%H%M%S')
SESSION_SCREENSHOT_DIR = os.path.join(SCREENSHOT_DIR, f"test_session_{SESSION_TIMESTAMP}")
os.makedirs(SESSION_SCREENSHOT_DIR, exist_ok=True)
print(f"Test session screenshots will be saved to: {SESSION_SCREENSHOT_DIR}")


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
    
    # Очищаем созданных тестовых пользователей после теста
    try:
        from utilities.user_cleanup import UserCleanup
        UserCleanup.cleanup_all_users()
    except Exception as e:
        print(f"Warning: Could not cleanup test users after test {test_name}: {e}")
        # Не прерываем выполнение из-за ошибки очистки
    
    # Очищаем thread-local storage после теста
    BasePage.set_test_dir(None)


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

