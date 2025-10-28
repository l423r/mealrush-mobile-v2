"""
Pytest configuration and fixtures
"""
import pytest
import os
import sys
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
from config.appium_config import APPIUM_SERVER_URL, ANDROID_CAPABILITIES, IOS_CAPABILITIES, TEST_TIMEOUT


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
def setup_test_environment(driver):
    """Настройка окружения для каждого теста"""
    # Делаем скриншот начала теста
    driver.save_screenshot('screenshots/test_start.png')
    
    yield
    
    # Делаем скриншот конца теста
    driver.save_screenshot('screenshots/test_end.png')


@pytest.fixture(scope='function')
def test_user():
    """Возвращает тестового пользователя"""
    import random
    import string
    
    # Генерируем случайные данные для теста
    random_string = ''.join(random.choices(string.ascii_lowercase, k=6))
    email = f"test_{random_string}@example.com"
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
                screenshot_name = f"failure_{item.name}"
                driver.save_screenshot(f'screenshots/{screenshot_name}.png')
                print(f"\nScreenshot saved: screenshots/{screenshot_name}.png")
        except Exception as e:
            print(f"Failed to take screenshot: {e}")


# Pytest configuration
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

