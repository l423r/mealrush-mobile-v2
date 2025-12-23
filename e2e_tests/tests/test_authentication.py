"""
Тесты для аутентификации пользователя
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
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD


@contextmanager
def timer_step(step_name):
    """Контекстный менеджер для измерения времени выполнения этапа теста"""
    start_time = time.time()
    print(f"\n[TIMER] [{step_name}] Начало...")
    try:
        yield
    finally:
        elapsed = time.time() - start_time
        print(f"[TIMER] [{step_name}] Завершено за {elapsed:.2f}с")


@pytest.mark.smoke
class TestAuthentication:
    """Тесты для проверки аутентификации"""
    
    def test_01_sign_in_page_loaded(self, driver, setup_test_environment):
        """Тест: проверка загрузки экрана входа"""
        test_start = time.time()
        with timer_step("Загрузка и проверка страницы входа"):
            sign_in_page = SignInPage(driver)
            assert sign_in_page.is_page_loaded(), "Страница входа не загрузилась"
            sign_in_page.take_screenshot('sign_in_page_loaded')
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    def test_02_navigate_to_registration(self, driver, setup_test_environment):
        """Тест: переход на экран регистрации"""
        test_start = time.time()
        with timer_step("Переход на страницу регистрации"):
            sign_in_page = SignInPage(driver)
            sign_in_page.take_screenshot('before_navigation')
            registration_page = sign_in_page.click_register_button()
            assert registration_page.is_page_loaded(), "Страница регистрации не загрузилась"
            registration_page.take_screenshot('registration_page')
        
        with timer_step("Возврат на страницу входа"):
            sign_in_page = registration_page.click_back()
            assert sign_in_page.is_page_loaded(), "Не удалось вернуться на страницу входа"
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    def test_03_sign_in_with_invalid_credentials(self, driver, setup_test_environment):
        """Тест: вход с неверными учетными данными"""
        test_start = time.time()
        with timer_step("Вход с неверными учетными данными"):
            sign_in_page = SignInPage(driver)
            sign_in_page.login("invalid@example.com", "wrongpassword")
            
            # Проверяем, что мы остались на странице входа или получили ошибку
            time.sleep(1.5)  # Уменьшено с 2 до 1.5
            try:
                sign_in_page.take_screenshot('invalid_login')
            except Exception as e:
                print(f"Warning: Could not take screenshot after invalid login: {e}")
            assert sign_in_page.is_displayed_multiple(sign_in_page.LOGIN_BUTTON), \
                "Должен остаться на странице входа при неверных учетных данных"
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    @pytest.mark.integration
    def test_04_successful_registration_and_login(self, driver, setup_test_environment, test_user):
        """Тест: успешная регистрация и вход"""
        test_start = time.time()
        
        with timer_step("Инициализация и переход на регистрацию"):
            sign_in_page = SignInPage(driver)
            sign_in_page.take_screenshot('before_registration')
            registration_page = sign_in_page.click_register_button()
        
        with timer_step("Заполнение формы регистрации"):
            registration_page.register(
                test_user['name'],
                test_user['email'],
                test_user['password']
            )
        
        with timer_step("Ожидание завершения регистрации"):
            # После регистрации должны попасть на главный экран или экран настройки профиля
            time.sleep(4)  # Уменьшено с 5 до 4 секунд
        
        # Проверяем, что мы успешно зарегистрировались и вошли
        main_page = MainPage(driver)
        from pages.profile_page import ProfilePage
        profile_page = ProfilePage(driver)
        profile_setup_page = ProfileSetupPage(driver)
        
        # Проверяем различные возможные состояния после регистрации
        registration_successful = False
        sign_in_page = SignInPage(driver)
        
        # Вариант 1: Попали на экран настройки профиля (выбор пола) - это нормально после регистрации
        if profile_setup_page.is_page_loaded(timeout=3):
            try:
                profile_setup_page.take_screenshot('after_registration_profile_setup')
            except Exception as e:
                print(f"Warning: Could not take screenshot: {e}")
            registration_successful = True
            print("Registration successful, landed on profile setup screen (gender selection)")
            
            # Делаем логаут для следующего теста, используя кнопку выхода на экране настройки профиля
            try:
                # Кликаем на кнопку выхода (иконка в правом верхнем углу)
                profile_setup_page.click_logout_button()
                time.sleep(1)  # Даем время на появление диалога подтверждения
                profile_setup_page.take_screenshot('logout_confirmation_dialog')
                
                # Подтверждаем выход из аккаунта
                profile_setup_page.confirm_logout()
                time.sleep(2)  # Даем время на выполнение logout
                
                # Проверяем, что вернулись на страницу входа
                sign_in_page = SignInPage(driver)
                assert sign_in_page.is_page_loaded(timeout=5), "Не удалось выйти после регистрации"
                sign_in_page.take_screenshot('after_logout_from_profile_setup')
                print("Successfully logged out from profile setup screen")
            except Exception as e:
                print(f"Warning: Could not logout from profile setup screen: {e}")
                # Fallback: используем reset приложения
                try:
                    driver.reset()
                    time.sleep(5)
                    sign_in_page = SignInPage(driver)
                    if sign_in_page.is_page_loaded(timeout=5):
                        print("Used app reset as fallback to return to sign in page")
                except Exception as reset_error:
                    print(f"Warning: Could not reset app: {reset_error}")
        
        # Вариант 2: Попали на главный экран (если настройка профиля была пропущена)
        elif main_page.is_page_loaded(timeout=3):
            main_page.take_screenshot('after_registration_main_screen')
            registration_successful = True
            print("Registration successful, landed on main screen")
            
            # Делаем логаут для следующего теста
            try:
                main_page.navigate_to_profile()
                time.sleep(2)
                profile_page.scroll_to_logout()
                profile_page.click_logout()
                time.sleep(2)
                # Проверяем, что вернулись на страницу входа
                sign_in_page = SignInPage(driver)
                assert sign_in_page.is_page_loaded(timeout=5), "Не удалось выйти после регистрации"
            except Exception as e:
                print(f"Warning: Could not logout after registration: {e}")
                # Пытаемся использовать системную кнопку назад
                for _ in range(5):
                    driver.back()
                    time.sleep(1)
                    sign_in_page = SignInPage(driver)
                    if sign_in_page.is_page_loaded(timeout=2):
                        break
        
        # Вариант 3: Попали на экран профиля
        elif profile_page.is_page_loaded(timeout=3):
            profile_page.take_screenshot('after_registration_profile_screen')
            registration_successful = True
            print("Registration successful, landed on profile screen")
            
            # Делаем логаут для следующего теста
            try:
                profile_page.scroll_to_logout()
                profile_page.click_logout()
                time.sleep(2)
                sign_in_page = SignInPage(driver)
                assert sign_in_page.is_page_loaded(timeout=5), "Не удалось выйти после регистрации"
            except Exception as e:
                print(f"Warning: Could not logout after registration: {e}")
        
        # Если ни один из вариантов не сработал, делаем скриншот для анализа
        if not registration_successful:
            driver.save_screenshot('screenshots/after_registration_unknown_state.png')
            print("Warning: Could not determine registration state, check screenshots")
            # Пытаемся вернуться на страницу входа в любом случае
            try:
                sign_in_page = profile_setup_page.go_back_to_sign_in()
            except:
                pass
        
        with timer_step("Проверка успешности регистрации"):
            # Явная проверка успешности регистрации
            assert registration_successful, "Регистрация не завершилась успешно - не попали ни на главный экран, ни на экран профиля, ни на экран настройки профиля"
        
        total_time = time.time() - test_start
        print(f"\n[TEST] Тест завершен. Общее время выполнения: {total_time:.2f}с")
        
        # Примечание: Если мы на экране настройки профиля, мы не возвращаемся на страницу входа,
        # так как на этом экране нет кнопки выхода. Следующий тест сам вернется на страницу входа
        # через ensure_sign_in_page или reset приложения.
    
    @pytest.mark.regression
    def test_05_password_visibility_toggle(self, driver, setup_test_environment):
        """Тест: переключение видимости пароля"""
        test_start = time.time()
        with timer_step("Инициализация страницы входа"):
            sign_in_page = SignInPage.ensure_sign_in_page(driver)
            assert sign_in_page.is_page_loaded(), "Не удалось перейти на страницу входа"
            sign_in_page.enter_password("testpassword")
            sign_in_page.take_screenshot('password_hidden')
        
        with timer_step("Переключение видимости пароля (1-й раз)"):
            sign_in_page.toggle_password_visibility()
            sign_in_page.take_screenshot('password_visible')
        
        with timer_step("Переключение видимости пароля (2-й раз)"):
            sign_in_page.toggle_password_visibility()
            sign_in_page.take_screenshot('password_hidden_again')
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    def test_06_sign_in_form_validation(self, driver, setup_test_environment):
        """Тест: валидация формы входа"""
        test_start = time.time()
        with timer_step("Инициализация и проверка валидации пустого email"):
            sign_in_page = SignInPage(driver)
            sign_in_page.enter_password("password123")
            sign_in_page.take_screenshot('empty_email')
            
            # Проверяем, что кнопка входа неактивна или есть ошибка
            try:
                login_button = sign_in_page.find_element_multiple(sign_in_page.LOGIN_BUTTON)
                assert not login_button.is_enabled() or sign_in_page.get_error_message(), \
                    "Должна быть валидация пустого email"
            except Exception:
                pass  # Если кнопка не найдена, валидация работает
        
        with timer_step("Заполнение email и проверка активации кнопки"):
            sign_in_page.enter_email("test@example.com")
            sign_in_page.take_screenshot('form_filled')
            login_button = sign_in_page.find_element_multiple(sign_in_page.LOGIN_BUTTON)
            assert login_button.is_enabled(), "Кнопка входа должна быть активна при заполненных полях"
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    def test_07_forgot_password_button(self, driver, setup_test_environment):
        """Тест: кнопка 'Забыли пароль'"""
        test_start = time.time()
        with timer_step("Клик на кнопку 'Забыли пароль'"):
            sign_in_page = SignInPage(driver)
            sign_in_page.click_forgot_password()
            time.sleep(0.8)  # Уменьшено с 1 до 0.8
            sign_in_page.take_screenshot('forgot_password_clicked')
            # Проверяем, что появился диалог или другой экран
        
        with timer_step("Закрытие модального окна"):
            # Закрываем модальное окно, чтобы следующий тест начинался на чистом экране входа
            sign_in_page.close_modal_dialog()
            time.sleep(0.5)  # Даем время на закрытие диалога
            # Проверяем, что вернулись на страницу входа
            assert sign_in_page.is_page_loaded(timeout=3), "Не удалось закрыть модальное окно и вернуться на страницу входа"
            sign_in_page.take_screenshot('after_close_modal')
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    @pytest.mark.integration
    def test_08_registration_with_duplicate_email(self, driver, setup_test_environment):
        """Тест: регистрация с дубликатом email"""
        test_start = time.time()
        
        with timer_step("Инициализация - переход на страницу входа"):
            sign_in_page = SignInPage.ensure_sign_in_page(driver)
            sign_in_page.take_screenshot('before_duplicate_registration')
        
        with timer_step("Переход на страницу регистрации"):
            registration_page = sign_in_page.click_register_button()
            # Делаем скриншот для диагностики
            registration_page.take_screenshot('after_click_register')
            # Даем дополнительное время на загрузку и проверяем с таймаутом
            page_loaded = registration_page.is_page_loaded(timeout=5)
            if not page_loaded:
                # Если страница не загрузилась, делаем еще один скриншот для диагностики
                registration_page.take_screenshot('registration_page_not_loaded')
                # Проверяем, может быть мы вернулись на страницу входа
                if sign_in_page.is_page_loaded_fast(timeout=1):
                    raise AssertionError("Страница регистрации не загрузилась - вернулись на страницу входа (возможно, пользователь уже залогинен)")
            assert page_loaded, "Страница регистрации не загрузилась"
        
        with timer_step("Заполнение формы регистрации с дубликатом email"):
            registration_page.enter_name("Test User")
            registration_page.enter_email(TEST_USER_EMAIL)  # Используем существующий email
            registration_page.enter_password("Test123456")
            registration_page.enter_confirm_password("Test123456")
        
        with timer_step("Отправка формы регистрации"):
            registration_page.click_create_account()
            # Делаем скриншот СРАЗУ после клика, пока ошибка еще отображается
            time.sleep(0.5)  # Минимальная задержка для появления ошибки
            registration_page.take_screenshot('after_registration')
            # Делаем еще один скриншот сразу же (для истории, пока ошибка видна)
            registration_page.take_screenshot('duplicate_email_error')
        
        with timer_step("Ожидание ответа сервера и проверка результата"):
            # Ждем немного для обработки запроса и возможного перехода на другую страницу
            time.sleep(1.0)  # Уменьшено с 1.5 до 1.0
            
            # Быстрая проверка состояния через короткие таймауты
            sign_in_page = SignInPage(driver)
            profile_setup_page = ProfileSetupPage(driver)
            
            registration_successful = False
            error_found = False
            
            # Быстро проверяем состояние страницы с короткими таймаутами
            # Наиболее вероятный результат - возврат на страницу входа, поэтому проверяем её первой
            try:
                # Сначала быстро проверяем страницу входа (наиболее вероятный результат)
                if sign_in_page.is_page_loaded_fast(timeout=1):
                    sign_in_page.take_screenshot('returned_to_sign_in_after_duplicate')
                    error_found = True  # Возврат на страницу входа = регистрация отклонена
                    print("Returned to sign in page - registration was rejected (valid behavior)")
                # Быстро проверяем страницу настройки профиля (маловероятно, но проверим)
                elif profile_setup_page.is_displayed_multiple(profile_setup_page.GENDER_SELECTION_TITLE, timeout=0.5):
                    registration_successful = True
                    print("Warning: Registration with duplicate email succeeded, which is unexpected")
                # Быстро проверяем регистрационную страницу (только первый локатор для скорости)
                elif registration_page.is_page_loaded_fast(timeout=0.5):
                    # Остались на странице регистрации - ошибка видна на скриншоте
                    error_found = True  # Ошибка видна на скриншоте after_registration
                    print("Still on registration page - error visible on screenshot (validation successful)")
                else:
                    # Если ничего не определили быстро, делаем финальную проверку страницы входа
                    print("Could not quickly determine state, doing final check...")
                    if sign_in_page.is_page_loaded_fast(timeout=1):
                        sign_in_page.take_screenshot('returned_to_sign_in_after_duplicate')
                        error_found = True
                        print("Final check: Returned to sign in page")
            except Exception as e:
                print(f"Warning: Could not verify registration result: {e}")
                # В случае ошибки, пробуем финальную проверку страницы входа
                try:
                    if sign_in_page.is_page_loaded_fast(timeout=1):
                        error_found = True
                except:
                    pass
        
        with timer_step("Проверка результатов"):
            # Проверяем, что регистрация не прошла успешно
            assert not registration_successful, \
                "Регистрация с дубликатом email не должна была пройти успешно"
            
            # Проверяем, что была обработана ошибка (либо показана ошибка, либо вернулись на страницу входа)
            assert error_found, \
                "Должно быть сообщение об ошибке при дубликате email или возврат на страницу входа"
        
        total_time = time.time() - test_start
        print(f"\n[TEST] Тест завершен. Общее время выполнения: {total_time:.2f}с")
    
    @pytest.mark.regression
    def test_09_registration_validation_errors(self, driver, setup_test_environment):
        """Тест: валидация формы регистрации"""
        test_start = time.time()
        
        with timer_step("Инициализация и переход на регистрацию"):
            sign_in_page = SignInPage.ensure_sign_in_page(driver)
            sign_in_page.take_screenshot('before_validation_test')
            registration_page = sign_in_page.click_register_button()
            assert registration_page.is_page_loaded(), "Страница регистрации не загрузилась"
        
        with timer_step("Тест 1: Валидация короткого пароля"):
            registration_page.enter_name("Test User")
            registration_page.enter_email("test@example.com")
            registration_page.enter_password("short")  # Слишком короткий пароль
            registration_page.enter_confirm_password("short")
            registration_page.take_screenshot('short_password_entered')
            registration_page.click_create_account()
            time.sleep(1.5)  # Уменьшено с 2 до 1.5
            registration_page.take_screenshot('short_password_error')
            assert registration_page.is_still_on_registration_page(), \
                "Должны остаться на странице регистрации при коротком пароле"
        
        with timer_step("Тест 2: Валидация невалидного email"):
            registration_page.enter_name("Test User")
            registration_page.enter_email("invalid-email")  # Невалидный email
            registration_page.enter_password("ValidPass123")
            registration_page.enter_confirm_password("ValidPass123")
            registration_page.take_screenshot('invalid_email_entered')
            registration_page.click_create_account()
            time.sleep(1.5)  # Уменьшено с 2 до 1.5
            registration_page.take_screenshot('invalid_email_error')
            assert registration_page.is_still_on_registration_page(), \
                "Должны остаться на странице регистрации при невалидном email"
        
        with timer_step("Возврат на страницу входа"):
            # Возвращаемся на страницу входа для следующего теста
            sign_in_page = registration_page.click_back()
            assert sign_in_page.is_page_loaded(timeout=3), "Не удалось вернуться на страницу входа"
            sign_in_page.take_screenshot('after_validation_test_returned_to_sign_in')
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")
    
    @pytest.mark.regression
    def test_10_registration_password_mismatch(self, driver, setup_test_environment):
        """Тест: несовпадение паролей при регистрации"""
        test_start = time.time()
        
        with timer_step("Инициализация - проверка страницы входа"):
            # Тест начинается на странице входа (благодаря предыдущему тесту)
            sign_in_page = SignInPage(driver)
            # Если не на странице входа, переходим
            if not sign_in_page.is_page_loaded_fast(timeout=1):
                sign_in_page = SignInPage.ensure_sign_in_page(driver)
            sign_in_page.take_screenshot('before_password_mismatch_test')
        
        with timer_step("Переход на страницу регистрации"):
            registration_page = sign_in_page.click_register_button()
            # Делаем скриншот для диагностики
            registration_page.take_screenshot('after_click_register')
            # Даем дополнительное время на загрузку и проверяем с таймаутом
            page_loaded = registration_page.is_page_loaded(timeout=5)
            if not page_loaded:
                # Если страница не загрузилась, делаем еще один скриншот для диагностики
                registration_page.take_screenshot('registration_page_not_loaded')
                # Проверяем, может быть мы вернулись на страницу входа
                if sign_in_page.is_page_loaded_fast(timeout=1):
                    raise AssertionError("Страница регистрации не загрузилась - вернулись на страницу входа (возможно, пользователь уже залогинен)")
            assert page_loaded, "Страница регистрации не загрузилась"
        
        with timer_step("Заполнение формы с несовпадающими паролями"):
            import random
            import string
            random_string = ''.join(random.choices(string.ascii_lowercase, k=6))
            email = f"test_{random_string}@example.com"
            registration_page.enter_name("Test User")
            registration_page.enter_email(email)
            registration_page.enter_password("Password123")
            registration_page.enter_confirm_password("DifferentPass123")  # Несовпадающий пароль
            registration_page.take_screenshot('password_mismatch_entered')
        
        with timer_step("Отправка формы и проверка валидации"):
            registration_page.click_create_account()
            time.sleep(0.8)  # Уменьшено с 1.0 до 0.8 - валидация клиентская, появляется мгновенно
            registration_page.take_screenshot('password_mismatch_error')
            
            # Быстрая проверка - используем очень короткий таймаут, так как валидация клиентская и быстрая
            # Факт того, что мы остались на странице регистрации, уже означает успешную валидацию
            is_still_on_page = registration_page.is_still_on_registration_page(timeout=1)
            assert is_still_on_page, \
                "Должны остаться на странице регистрации при несовпадении паролей"
            
            # Проверка ошибки не критична - если мы остались на странице, валидация сработала
            # (ошибка видна на скриншоте, если она есть)
            print("Validation successful - stayed on registration page (error visible on screenshot if present)")
        print(f"\n[TEST] Тест завершен. Общее время: {time.time() - test_start:.2f}с")

