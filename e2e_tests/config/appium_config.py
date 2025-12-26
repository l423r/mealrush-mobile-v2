"""
Конфигурация для Appium тестов
"""
import os
from datetime import datetime

# Определяем корень проекта (mealrush-mobile-v2)
# Этот файл находится в e2e_tests/config/, корень проекта на 2 уровня выше
_CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
_E2E_TESTS_DIR = os.path.dirname(_CONFIG_DIR)
PROJECT_ROOT = os.path.dirname(_E2E_TESTS_DIR)

def _resolve_app_path(relative_path):
    """Разрешает путь к приложению относительно корня проекта или делает абсолютным"""
    app_path = os.getenv('ANDROID_APP_PATH', relative_path)
    
    # Если путь абсолютный, возвращаем как есть
    if os.path.isabs(app_path):
        return app_path
    
    # Если путь начинается с ../, разрешаем относительно e2e_tests/
    if app_path.startswith('../'):
        resolved = os.path.join(_E2E_TESTS_DIR, app_path)
    else:
        # Иначе разрешаем относительно корня проекта
        resolved = os.path.join(PROJECT_ROOT, app_path)
    
    # Преобразуем в абсолютный путь и нормализуем
    resolved = os.path.abspath(resolved)
    
    # Проверяем существование файла
    if not os.path.exists(resolved):
        raise FileNotFoundError(
            f"APK файл не найден: {resolved}\n"
            f"Проверьте путь в переменной окружения ANDROID_APP_PATH или соберите APK: "
            f"cd {PROJECT_ROOT}/android && ./gradlew assembleDebug"
        )
    
    return resolved

# Appium Server Configuration
# Appium 2.x uses /session instead of /wd/hub/session
APPIUM_SERVER_URL = os.getenv('APPIUM_SERVER_URL', 'http://localhost:4723')

# Capabilities для Android
ANDROID_CAPABILITIES = {
    'platformName': 'Android',
    'platformVersion': os.getenv('ANDROID_PLATFORM_VERSION', '13'),  # Измените на вашу версию
    'deviceName': os.getenv('ANDROID_DEVICE_NAME', 'Android Emulator'),
    'app': _resolve_app_path('android/app/build/outputs/apk/debug/app-debug.apk'),
    'appPackage': 'com.l423r.FoodApp',  # Package name из app.json
    'appActivity': '.MainActivity',
    'automationName': 'UiAutomator2',
    'noReset': False,
    'fullReset': False,
    'newCommandTimeout': 300,
    'autoGrantPermissions': True,
    'unicodeKeyboard': True,
    'resetKeyboard': True,
}

def _resolve_ios_app_path(relative_path):
    """Разрешает путь к iOS приложению относительно корня проекта или делает абсолютным"""
    app_path = os.getenv('IOS_APP_PATH', relative_path)
    
    # Если путь абсолютный, возвращаем как есть
    if os.path.isabs(app_path):
        return app_path
    
    # Если путь начинается с ../, разрешаем относительно e2e_tests/
    if app_path.startswith('../'):
        resolved = os.path.join(_E2E_TESTS_DIR, app_path)
    else:
        # Иначе разрешаем относительно корня проекта
        resolved = os.path.join(PROJECT_ROOT, app_path)
    
    # Преобразуем в абсолютный путь и нормализуем
    return os.path.abspath(resolved)

# Capabilities для iOS
IOS_CAPABILITIES = {
    'platformName': 'iOS',
    'platformVersion': os.getenv('IOS_PLATFORM_VERSION', '17.0'),
    'deviceName': os.getenv('IOS_DEVICE_NAME', 'iPhone 15 Pro'),
    'app': _resolve_ios_app_path('build/iphone/FoodApp.app'),
    'automationName': 'XCUITest',
    'noReset': False,
    'fullReset': False,
    'newCommandTimeout': 300,
}

# Test Configuration
TEST_TIMEOUT = 30  # секунды
IMPLICIT_WAIT = 10  # секунды
EXPLICIT_WAIT = 20  # секунды

# Screenshot Configuration
SCREENSHOT_DIR = 'screenshots'
SCREENSHOT_ON_FAILURE = True

# Test Data
TEST_USER_EMAIL = os.getenv('TEST_USER_EMAIL', 'test@example.com')
TEST_USER_PASSWORD = os.getenv('TEST_USER_PASSWORD', 'Test123456')
TEST_USER_NAME = os.getenv('TEST_USER_NAME', 'Test User')

# Create screenshot directory if not exists
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def get_timestamp():
    """Возвращает текущую временную метку в формате строки"""
    return datetime.now().strftime('%Y%m%d_%H%M%S')

