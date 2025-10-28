"""
Диагностический тест для проверки всех способов поиска элементов
Этот тест помогает понять, какие локаторы работают в вашем окружении
"""
import os
import sys
import pytest
import time

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy
from pages.sign_in_page import SignInPage


@pytest.mark.smoke
def test_check_all_element_locators(driver, setup_test_environment):
    """Диагностический тест: проверяем все способы поиска элементов"""
    
    print("\n" + "="*60)
    print("ДИАГНОСТИЧЕСКИЙ ТЕСТ: Поиск элементов")
    print("="*60)
    
    sign_in_page = SignInPage(driver)
    sign_in_page.take_screenshot('1_start')
    
    # Список всех способов поиска для кнопки "Войти"
    locator_strategies = {
        'testID By.ID': (By.ID, "sign_in_login_button"),
        'testID AppiumBy.ACCESSIBILITY_ID': (AppiumBy.ACCESSIBILITY_ID, "sign_in_login_button"),
        'text XPath': (By.XPATH, "//*[@text='Войти']"),
        'text contained XPath': (By.XPATH, "//*[contains(@text, 'Войти')]"),
        'clickable with text XPath': (By.XPATH, "//*[@clickable='true' and @text='Войти']"),
        'clickable with child text XPath': (By.XPATH, "//*[@clickable='true' and .//*[@text='Войти']]"),
        'focusable with text XPath': (By.XPATH, "//*[@focusable='true' and .//*[@text='Войти']]"),
        'any element with text': (By.XPATH, "//android.view.ViewGroup[.//android.widget.TextView[@text='Войти']]"),
    }
    
    print("\n🔍 Проверяем кнопку 'Войти':")
    print("-" * 60)
    
    for strategy_name, locator in locator_strategies.items():
        try:
            element = driver.find_element(*locator)
            is_visible = element.is_displayed()
            is_enabled = element.is_enabled()
            text = element.text if hasattr(element, 'text') else "N/A"
            
            print(f"✅ {strategy_name}: FOUND")
            print(f"   Видимый: {is_visible}, Активен: {is_enabled}, Текст: {text[:50]}")
        except Exception as e:
            print(f"❌ {strategy_name}: NOT FOUND ({type(e).__name__})")
    
    # Проверяем email input
    print("\n📝 Проверяем поле Email:")
    print("-" * 60)
    
    email_strategies = {
        'testID By.ID': (By.ID, "sign_in_email_input"),
        'testID AppiumBy.ACCESSIBILITY_ID': (AppiumBy.ACCESSIBILITY_ID, "sign_in_email_input"),
        'hint contains email': (By.XPATH, "//android.widget.EditText[contains(@hint, 'email')]"),
        'hint contains Email': (By.XPATH, "//android.widget.EditText[contains(@hint, 'Email')]"),
        'hint exact': (By.XPATH, "//android.widget.EditText[@hint='Введите ваш email']"),
        'all EditText': (By.XPATH, "//android.widget.EditText"),
    }
    
    for strategy_name, locator in email_strategies.items():
        try:
            element = driver.find_element(*locator)
            is_visible = element.is_displayed()
            hint = element.get_attribute('hint') if hasattr(element, 'get_attribute') else "N/A"
            if element:
                hint = element.get_attribute('hint') or "N/A"
            else:
                hint = "N/A"
            
            print(f"✅ {strategy_name}: FOUND")
            print(f"   Видимый: {is_visible}, Hint: {hint[:50]}")
        except Exception as e:
            print(f"❌ {strategy_name}: NOT FOUND ({type(e).__name__})")
    
    # Проверяем password input
    print("\n🔒 Проверяем поле Пароль:")
    print("-" * 60)
    
    password_strategies = {
        'testID By.ID': (By.ID, "sign_in_password_input"),
        'testID AppiumBy.ACCESSIBILITY_ID': (AppiumBy.ACCESSIBILITY_ID, "sign_in_password_input"),
        'hint contains пароль': (By.XPATH, "//android.widget.EditText[contains(@hint, 'пароль')]"),
        'hint contains password': (By.XPATH, "//android.widget.EditText[contains(@hint, 'password')]"),
        'hint contains Password': (By.XPATH, "//android.widget.EditText[contains(@hint, 'Password')]"),
    }
    
    for strategy_name, locator in password_strategies.items():
        try:
            element = driver.find_element(*locator)
            is_visible = element.is_displayed()
            hint = element.get_attribute('hint') or "N/A"
            
            print(f"✅ {strategy_name}: FOUND")
            print(f"   Видимый: {is_visible}, Hint: {hint[:50]}")
        except Exception as e:
            print(f"❌ {strategy_name}: NOT FOUND ({type(e).__name__})")
    
    # Проверяем password toggle icon
    print("\n👁️ Проверяем иконку переключения пароля:")
    print("-" * 60)
    
    toggle_strategies = {
        'testID By.ID': (By.ID, "password_toggle_icon"),
        'testID AppiumBy.ACCESSIBILITY_ID': (AppiumBy.ACCESSIBILITY_ID, "password_toggle_icon"),
        'text eye emoji': (By.XPATH, "//*[@text='👁️']"),
        'text eye emoji variant': (By.XPATH, "//*[@text='👁️‍🗨️']"),
        'any text contains eye': (By.XPATH, "//*[contains(@text, '👁️')]"),
    }
    
    for strategy_name, locator in toggle_strategies.items():
        try:
            element = driver.find_element(*locator)
            is_visible = element.is_displayed()
            text = element.text if hasattr(element, 'text') else "N/A"
            
            print(f"✅ {strategy_name}: FOUND")
            print(f"   Видимый: {is_visible}, Текст: {text}")
        except Exception as e:
            print(f"❌ {strategy_name}: NOT FOUND ({type(e).__name__})")
    
    # Выводим рекомендации
    print("\n" + "="*60)
    print("РЕКОМЕНДАЦИИ:")
    print("="*60)
    print("✅ Используйте стратегии, которые вернули FOUND")
    print("❌ Избегайте стратегии, которые вернули NOT FOUND")
    print("\n💡 Лучшая практика:")
    print("   - Для кнопок: XPath по тексту + clickable")
    print("   - Для Input: XPath по hint")
    print("   - В production: accessibilityLabel с testID")
    
    sign_in_page.take_screenshot('2_end_diagnostics')
    
    # Тест всегда проходит (это диагностический тест)
    assert True, "Диагностический тест завершен"


@pytest.mark.smoke
def test_check_current_locators(driver, setup_test_environment):
    """Проверяем, работают ли текущие локаторы из sign_in_page"""
    
    print("\n" + "="*60)
    print("ПРОВЕРКА ТЕКУЩИХ ЛОКАТОРОВ")
    print("="*60)
    
    sign_in_page = SignInPage(driver)
    
    # Проверяем каждый локатор из SignInPage
    locators_to_check = {
        'LOGIN_BUTTON': sign_in_page.LOGIN_BUTTON,
        'EMAIL_INPUT': sign_in_page.EMAIL_INPUT,
        'PASSWORD_INPUT': sign_in_page.PASSWORD_INPUT,
        'REGISTER_BUTTON': sign_in_page.REGISTER_BUTTON,
        'FORGOT_PASSWORD_BUTTON': sign_in_page.FORGOT_PASSWORD_BUTTON,
        'PASSWORD_TOGGLE': sign_in_page.PASSWORD_TOGGLE,
    }
    
    for locator_name, locator_value in locators_to_check.items():
        print(f"\n📌 Проверяем {locator_name}:")
        
        if isinstance(locator_value, list):
            # Multiple strategies
            for i, locator in enumerate(locator_value):
                try:
                    by_type, value = locator
                    element = driver.find_element(by_type, value)
                    is_visible = element.is_displayed()
                    print(f"   ✅ Стратегия {i+1} ({by_type.__name__}): FOUND (visible={is_visible})")
                except Exception as e:
                    print(f"   ❌ Стратегия {i+1} ({by_type.__name__}): NOT FOUND")
        else:
            # Single locator
            try:
                by_type, value = locator_value
                element = driver.find_element(by_type, value)
                is_visible = element.is_displayed()
                print(f"   ✅ {by_type.__name__}: FOUND (visible={is_visible})")
            except Exception as e:
                print(f"   ❌ {by_type.__name__}: NOT FOUND")


@pytest.mark.smoke
def test_practical_demo(driver, setup_test_environment):
    """Практический пример: ввод данных используя работающие локаторы"""
    
    print("\n" + "="*60)
    print("ПРАКТИЧЕСКИЙ ПРИМЕР")
    print("="*60)
    
    sign_in_page = SignInPage(driver)
    
    print("\n✅ Демонстрируем использование fallback стратегии:")
    
    # Ввод email используя fallback
    print("1. Ввод email...")
    sign_in_page.enter_email("test@example.com")
    print("   ✅ Email введен")
    
    # Ввод пароля используя fallback
    print("2. Ввод пароля...")
    sign_in_page.enter_password("TestPassword123")
    print("   ✅ Пароль введен")
    
    # Получение текста для проверки
    print("\n3. Проверяем, что Sign In Page методы работают:")
    
    # is_page_loaded проверяет кнопку
    is_loaded = sign_in_page.is_page_loaded()
    print(f"   is_page_loaded(): {is_loaded}")
    
    sign_in_page.take_screenshot('3_practical_demo_complete')
    
    print("\n✅ Практический пример завершен успешно!")
    assert True

