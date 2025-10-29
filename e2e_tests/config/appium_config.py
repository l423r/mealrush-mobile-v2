"""
Конфигурация для Appium тестов
"""
import os
from datetime import datetime

# Appium Server Configuration
# Appium 2.x uses /session instead of /wd/hub/session
APPIUM_SERVER_URL = os.getenv('APPIUM_SERVER_URL', 'http://localhost:4723')

# Capabilities для Android
ANDROID_CAPABILITIES = {
    'platformName': 'Android',
    'platformVersion': os.getenv('ANDROID_PLATFORM_VERSION', '13'),  # Измените на вашу версию
    'deviceName': os.getenv('ANDROID_DEVICE_NAME', 'Android Emulator'),
    'app': os.getenv('ANDROID_APP_PATH', 'android/app/build/outputs/apk/debug/app-debug.apk'),
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

# Capabilities для iOS
IOS_CAPABILITIES = {
    'platformName': 'iOS',
    'platformVersion': os.getenv('IOS_PLATFORM_VERSION', '17.0'),
    'deviceName': os.getenv('IOS_DEVICE_NAME', 'iPhone 15 Pro'),
    'app': os.getenv('IOS_APP_PATH', 'build/iphone/FoodApp.app'),
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

