"""
Утилита для очистки тестовых пользователей после тестов
"""
import os
import requests
from typing import List, Set
from config.appium_config import TEST_USER_EMAIL

# URL бекенда из переменных окружения
# По умолчанию используем тот же URL, что и в мобильном приложении
# Можно переопределить через переменную окружения BACKEND_API_URL
# Формат: http://host:port/my-food (с /my-food в конце)
# BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://88.210.20.137:8083/my-food')
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8083/my-food')
AUTH_ENDPOINT = f"{BACKEND_API_URL}/auth/token"
PROFILE_DELETE_ENDPOINT = f"{BACKEND_API_URL}/user-profile"
USER_DELETE_ENDPOINT = f"{BACKEND_API_URL}/auth/user"  # Для удаления пользователя (если существует)

# Включить подробное логирование API запросов
DEBUG_API_CALLS = os.getenv('DEBUG_API_CALLS', 'true').lower() == 'true'


class UserCleanup:
    """Класс для управления очисткой тестовых пользователей"""
    
    _created_users: Set[str] = set()
    _user_passwords: dict[str, str] = {}  # Словарь email -> password
    
    @classmethod
    def register_user(cls, email: str, password: str = "Test123456"):
        """
        Регистрирует email созданного пользователя для последующего удаления
        
        Args:
            email: Email пользователя
            password: Пароль пользователя (по умолчанию "Test123456")
        """
        # Не регистрируем постоянного тестового пользователя
        if email != TEST_USER_EMAIL:
            cls._created_users.add(email)
            cls._user_passwords[email] = password
            print(f"[CLEANUP] Зарегистрирован пользователь для удаления: {email}")
    
    @classmethod
    def get_registered_users(cls) -> List[str]:
        """Возвращает список зарегистрированных пользователей"""
        return list(cls._created_users)
    
    @classmethod
    def get_user_password(cls, email: str) -> str | None:
        """Возвращает пароль пользователя по email"""
        return cls._user_passwords.get(email)
    
    @classmethod
    def unregister_user(cls, email: str):
        """Удаляет пользователя из списка зарегистрированных"""
        cls._created_users.discard(email)
        cls._user_passwords.pop(email, None)
    
    @classmethod
    def clear_registered_users(cls):
        """Очищает список зарегистрированных пользователей"""
        cls._created_users.clear()
        cls._user_passwords.clear()
    
    @classmethod
    def delete_user_profile(cls, email: str, password: str) -> bool:
        """
        Удаляет пользователя и его профиль через API
        
        Процесс удаления:
        1. Логинится для получения токена
        2. Удаляет профиль пользователя (DELETE /user-profile)
        3. Удаляет пользователя (DELETE /auth/user)
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            True если удаление успешно (или пользователь уже не существует), 
            False в противном случае
        """
        # Защита: никогда не удаляем постоянного тестового пользователя
        if email == TEST_USER_EMAIL:
            print(f"[CLEANUP] ⚠ Попытка удалить постоянного тестового пользователя {email} заблокирована")
            return True  # Возвращаем True, так как это не ошибка, а защита
        
        try:
            # Шаг 1: Логинимся для получения токена
            if DEBUG_API_CALLS:
                print(f"[CLEANUP] [API] POST {AUTH_ENDPOINT} (login для {email})")
            
            login_response = requests.post(
                AUTH_ENDPOINT,
                json={
                    "email": email,
                    "password": password
                },
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[CLEANUP] [API] Response: {login_response.status_code} {login_response.reason}")
                if login_response.status_code != 200:
                    try:
                        print(f"[CLEANUP] [API] Response body: {login_response.text[:200]}")
                    except:
                        pass
            
            if login_response.status_code == 404:
                # Пользователь не существует (уже удален или никогда не был создан) - это нормально
                print(f"[CLEANUP] ✓ Пользователь {email} не найден (уже удален или не был создан)")
                return True  # Считаем успешным, так как пользователя уже нет
            elif login_response.status_code != 200:
                # Другая ошибка при логине
                print(f"[CLEANUP] ✗ Не удалось залогиниться под {email}: {login_response.status_code}")
                if DEBUG_API_CALLS:
                    try:
                        print(f"[CLEANUP] [API] Error response: {login_response.text[:500]}")
                    except:
                        pass
                return False
            
            token_data = login_response.json()
            # Согласно API документации, токен находится в поле jwtToken
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                print(f"[CLEANUP] ✗ Токен не получен для {email}. Ответ: {token_data}")
                return False
            
            if DEBUG_API_CALLS:
                print(f"[CLEANUP] [API] Токен получен успешно (длина: {len(token)} символов)")
            
            # Шаг 2: Удаляем профиль (если он существует)
            if DEBUG_API_CALLS:
                print(f"[CLEANUP] [API] DELETE {PROFILE_DELETE_ENDPOINT} (удаление профиля)")
            
            delete_profile_response = requests.delete(
                PROFILE_DELETE_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[CLEANUP] [API] Response: {delete_profile_response.status_code} {delete_profile_response.reason}")
            
            profile_deleted = False
            if delete_profile_response.status_code in [204, 200]:
                print(f"[CLEANUP] ✓ Профиль пользователя {email} удален")
                profile_deleted = True
            elif delete_profile_response.status_code == 404:
                # Профиль не существует - это нормально, пользователь мог не создать профиль
                print(f"[CLEANUP] ✓ Профиль пользователя {email} не найден (возможно, не был создан)")
                profile_deleted = True  # Считаем успешным, так как профиля нет
            else:
                print(f"[CLEANUP] ⚠ Не удалось удалить профиль {email}: {delete_profile_response.status_code}")
                if DEBUG_API_CALLS:
                    try:
                        print(f"[CLEANUP] [API] Error response: {delete_profile_response.text[:500]}")
                    except:
                        pass
            
            # Шаг 3: Удаляем пользователя через API (эндпоинт DELETE /auth/user)
            if DEBUG_API_CALLS:
                print(f"[CLEANUP] [API] DELETE {USER_DELETE_ENDPOINT} (удаление пользователя)")
            
            try:
                delete_user_response = requests.delete(
                    USER_DELETE_ENDPOINT,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    timeout=10
                )
                
                if DEBUG_API_CALLS:
                    print(f"[CLEANUP] [API] Response: {delete_user_response.status_code} {delete_user_response.reason}")
                
                if delete_user_response.status_code in [204, 200]:
                    print(f"[CLEANUP] ✓ Пользователь {email} полностью удален (профиль + аккаунт)")
                    return True
                elif delete_user_response.status_code == 404:
                    # Эндпоинт не найден
                    if DEBUG_API_CALLS:
                        print(f"[CLEANUP] [API] Эндпоинт удаления пользователя не найден (404)")
                    print(f"[CLEANUP] ⚠ Пользователь {email} не удален полностью - удален только профиль")
                    return profile_deleted
                elif delete_user_response.status_code == 405:
                    # Method not allowed
                    if DEBUG_API_CALLS:
                        print(f"[CLEANUP] [API] Метод DELETE не поддерживается для /auth/user (405)")
                    print(f"[CLEANUP] ⚠ Пользователь {email} не удален полностью - удален только профиль")
                    return profile_deleted
                elif delete_user_response.status_code == 500:
                    # Серверная ошибка - ВСЕГДА логируем тело ответа для диагностики
                    error_body = ""
                    try:
                        error_body = delete_user_response.text[:1000]  # Увеличено до 1000 символов
                    except:
                        pass
                    print(f"[CLEANUP] ✗ Ошибка сервера при удалении пользователя {email}: 500")
                    if error_body:
                        print(f"[CLEANUP] [API] Error response body:\n{error_body}")
                    else:
                        print(f"[CLEANUP] [API] Response body пустой или нечитаемый")
                    print(f"[CLEANUP] ⚠ Удален только профиль, пользователь остался в БД из-за ошибки сервера")
                    return profile_deleted  # Частично успешно
                else:
                    # Другие ошибки - логируем детали
                    error_body = ""
                    try:
                        error_body = delete_user_response.text[:1000]
                    except:
                        pass
                    print(f"[CLEANUP] ⚠ Неожиданный статус при удалении пользователя {email}: {delete_user_response.status_code}")
                    if error_body:
                        print(f"[CLEANUP] [API] Response body:\n{error_body}")
                    elif DEBUG_API_CALLS:
                        print(f"[CLEANUP] [API] Response body пустой или нечитаемый")
                    return profile_deleted  # Частично успешно
            except requests.exceptions.RequestException as e:
                # Ошибка сети
                if DEBUG_API_CALLS:
                    print(f"[CLEANUP] [API] Ошибка сети при попытке удалить пользователя: {e}")
                print(f"[CLEANUP] ⚠ Не удалось удалить пользователя {email} из-за ошибки сети - удален только профиль")
                return profile_deleted  # Частично успешно
            
            # Если дошли сюда (не должно случиться), возвращаем результат удаления профиля
            return profile_deleted
                
        except requests.exceptions.RequestException as e:
            print(f"[CLEANUP] Ошибка сети при удалении пользователя {email}: {e}")
            return False
        except Exception as e:
            print(f"[CLEANUP] Неожиданная ошибка при удалении {email}: {e}")
            return False
    
    @classmethod
    def cleanup_all_users(cls, default_password: str = "Test123456"):
        """
        Удаляет всех зарегистрированных тестовых пользователей
        
        Args:
            default_password: Пароль по умолчанию для тестовых пользователей (если не указан при регистрации)
        """
        if not cls._created_users:
            return
        
        print(f"\n[CLEANUP] Начало очистки {len(cls._created_users)} тестовых пользователей...")
        
        deleted_count = 0
        failed_count = 0
        
        # Создаем копию списка, так как мы модифицируем множество в цикле
        emails_to_cleanup = list(cls._created_users)
        for email in emails_to_cleanup:
            if email == TEST_USER_EMAIL:
                print(f"[CLEANUP] ⚠ Пропущен постоянный тестовый пользователь: {email} (не должен удаляться)")
                cls._created_users.discard(email)
                continue
            
            # Используем сохраненный пароль или пароль по умолчанию
            password = cls._user_passwords.get(email, default_password)
            
            result = cls.delete_user_profile(email, password)
            if result:
                # Проверяем, был ли пользователь уже удален (через логику в delete_user_profile)
                # Если результат True и сообщение содержит "не найден" или "не существует", это уже удаленный
                deleted_count += 1
                cls._created_users.discard(email)
                cls._user_passwords.pop(email, None)
            else:
                failed_count += 1
        
        # Формируем итоговое сообщение
        if failed_count == 0:
            print(f"[CLEANUP] ✓ Очистка завершена: обработано {deleted_count} пользователей (все успешно)")
        else:
            print(f"[CLEANUP] Очистка завершена: удалено {deleted_count}, ошибок {failed_count}")
        
        # Примечание: API эндпоинт DELETE /auth/user теперь доступен для полного удаления пользователя
        
        # Очищаем списки после очистки
        cls.clear_registered_users()
        cls._user_passwords.clear()

