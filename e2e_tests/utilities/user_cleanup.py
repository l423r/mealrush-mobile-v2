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
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://88.210.20.137:8083/my-food')
AUTH_ENDPOINT = f"{BACKEND_API_URL}/auth/token"
PROFILE_DELETE_ENDPOINT = f"{BACKEND_API_URL}/user-profile"


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
    def clear_registered_users(cls):
        """Очищает список зарегистрированных пользователей"""
        cls._created_users.clear()
        cls._user_passwords.clear()
    
    @classmethod
    def delete_user_profile(cls, email: str, password: str) -> bool:
        """
        Удаляет профиль пользователя через API
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            True если удаление успешно, False в противном случае
        """
        try:
            # Шаг 1: Логинимся для получения токена
            login_response = requests.post(
                AUTH_ENDPOINT,
                json={
                    "email": email,
                    "password": password
                },
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if login_response.status_code != 200:
                # Если не удалось залогиниться, возможно пользователь уже удален или не существует
                print(f"[CLEANUP] Не удалось залогиниться под {email}: {login_response.status_code} (возможно, уже удален)")
                return False
            
            token_data = login_response.json()
            # Согласно API документации, токен находится в поле jwtToken
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                print(f"[CLEANUP] Токен не получен для {email}. Ответ: {token_data}")
                return False
            
            # Шаг 2: Удаляем профиль (если он существует)
            delete_response = requests.delete(
                PROFILE_DELETE_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if delete_response.status_code in [204, 200]:
                print(f"[CLEANUP] ✓ Профиль пользователя {email} удален")
                return True
            elif delete_response.status_code == 404:
                # Профиль не существует - это нормально, пользователь мог не создать профиль
                print(f"[CLEANUP] ✓ Профиль пользователя {email} не найден (возможно, не был создан)")
                return True  # Считаем успешным, так как профиля нет
            else:
                print(f"[CLEANUP] ✗ Не удалось удалить профиль {email}: {delete_response.status_code}")
                return False
                
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
        
        for email in list(cls._created_users):
            if email == TEST_USER_EMAIL:
                print(f"[CLEANUP] Пропущен постоянный тестовый пользователь: {email}")
                cls._created_users.discard(email)
                continue
            
            # Используем сохраненный пароль или пароль по умолчанию
            password = cls._user_passwords.get(email, default_password)
            
            if cls.delete_user_profile(email, password):
                deleted_count += 1
                cls._created_users.discard(email)
                cls._user_passwords.pop(email, None)
            else:
                failed_count += 1
        
        print(f"[CLEANUP] Очистка завершена: удалено {deleted_count}, ошибок {failed_count}")
        
        # Очищаем списки после очистки
        cls.clear_registered_users()
        cls._user_passwords.clear()

