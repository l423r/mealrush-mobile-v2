"""
Утилита для управления пользователями в тестах (деактивация, получение информации)
"""
import os
import requests
from typing import Optional, Dict, Any

# URL бекенда из переменных окружения
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8083/my-food')
AUTH_ENDPOINT = f"{BACKEND_API_URL}/auth/token"
USER_ENDPOINT = f"{BACKEND_API_URL}/auth/user"
USER_DELETE_ENDPOINT = f"{BACKEND_API_URL}/auth/user"

# Включить подробное логирование API запросов
DEBUG_API_CALLS = os.getenv('DEBUG_API_CALLS', 'true').lower() == 'true'


class UserManagement:
    """Класс для управления пользователями в тестах"""
    
    @staticmethod
    def get_user_id(email: str, password: str) -> Optional[int]:
        """
        Получает ID пользователя через API
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            User ID если успешно, None в противном случае
        """
        try:
            # Логинимся для получения токена
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] POST {AUTH_ENDPOINT} (login для получения userId)")
            
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
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Login failed: {login_response.status_code}")
                return None
            
            token_data = login_response.json()
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Token not found in response")
                return None
            
            # Получаем информацию о пользователе
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] GET {USER_ENDPOINT} (получение userId)")
            
            user_response = requests.get(
                USER_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if user_response.status_code != 200:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Get user failed: {user_response.status_code}")
                return None
            
            user_data = user_response.json()
            user_id = user_data.get("id")
            
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] User ID получен: {user_id}")
            
            return user_id
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] Ошибка при получении userId: {e}")
            return None
    
    @staticmethod
    def get_user_info(email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Получает информацию о пользователе через API
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            Словарь с информацией о пользователе или None
        """
        try:
            # Логинимся для получения токена
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] POST {AUTH_ENDPOINT} (login для получения user info)")
            
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
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Login failed: {login_response.status_code}")
                return None
            
            token_data = login_response.json()
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Token not found in response")
                return None
            
            # Получаем информацию о пользователе
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] GET {USER_ENDPOINT} (получение user info)")
            
            user_response = requests.get(
                USER_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if user_response.status_code != 200:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Get user failed: {user_response.status_code}")
                return None
            
            user_data = user_response.json()
            
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] User info получена: {user_data.get('email')}")
            
            return user_data
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] Ошибка при получении user info: {e}")
            return None
    
    @staticmethod
    def delete_user_via_api(email: str, password: str) -> bool:
        """
        Удаляет пользователя через API (DELETE /auth/user)
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            True если удаление успешно, False в противном случае
        """
        try:
            # Логинимся для получения токена
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] POST {AUTH_ENDPOINT} (login для удаления пользователя)")
            
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
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Login failed: {login_response.status_code}")
                return False
            
            token_data = login_response.json()
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Token not found in response")
                return False
            
            # Удаляем пользователя
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] DELETE {USER_DELETE_ENDPOINT} (удаление пользователя)")
            
            delete_response = requests.delete(
                USER_DELETE_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] Response: {delete_response.status_code} {delete_response.reason}")
            
            if delete_response.status_code in [204, 200]:
                print(f"[USER_MGMT] ✓ Пользователь {email} удален через API")
                return True
            else:
                print(f"[USER_MGMT] ✗ Не удалось удалить пользователя {email}: {delete_response.status_code}")
                if DEBUG_API_CALLS:
                    try:
                        print(f"[USER_MGMT] [API] Error response: {delete_response.text[:500]}")
                    except:
                        pass
                return False
                
        except Exception as e:
            print(f"[USER_MGMT] Ошибка при удалении пользователя {email}: {e}")
            return False
    
    @staticmethod
    def deactivate_user(email: str, password: str) -> bool:
        """
        Деактивирует пользователя (устанавливает active = false)
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            True если деактивация успешна, False в противном случае
        """
        try:
            # Логинимся для получения токена
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] POST {AUTH_ENDPOINT} (login для деактивации пользователя)")
            
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
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Login failed: {login_response.status_code}")
                return False
            
            token_data = login_response.json()
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Token not found in response")
                return False
            
            # Деактивируем пользователя через PATCH /auth/user/active?active=false
            deactivate_url = f"{USER_ENDPOINT}/active"
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] PATCH {deactivate_url}?active=false (деактивация пользователя)")
            
            deactivate_response = requests.patch(
                deactivate_url,
                params={"active": False},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] Response: {deactivate_response.status_code} {deactivate_response.reason}")
            
            if deactivate_response.status_code in [204, 200]:
                print(f"[USER_MGMT] ✓ Пользователь {email} деактивирован")
                return True
            else:
                print(f"[USER_MGMT] ✗ Не удалось деактивировать пользователя {email}: {deactivate_response.status_code}")
                if DEBUG_API_CALLS:
                    try:
                        print(f"[USER_MGMT] [API] Error response: {deactivate_response.text[:500]}")
                    except:
                        pass
                return False
                
        except Exception as e:
            print(f"[USER_MGMT] Ошибка при деактивации пользователя {email}: {e}")
            return False
    
    @staticmethod
    def activate_user(email: str, password: str) -> bool:
        """
        Активирует пользователя (устанавливает active = true)
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            True если активация успешна, False в противном случае
        """
        try:
            # Логинимся для получения токена
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] POST {AUTH_ENDPOINT} (login для активации пользователя)")
            
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
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Login failed: {login_response.status_code}")
                return False
            
            token_data = login_response.json()
            token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            if not token:
                if DEBUG_API_CALLS:
                    print(f"[USER_MGMT] [API] Token not found in response")
                return False
            
            # Активируем пользователя через PATCH /auth/user/active?active=true
            activate_url = f"{USER_ENDPOINT}/active"
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] PATCH {activate_url}?active=true (активация пользователя)")
            
            activate_response = requests.patch(
                activate_url,
                params={"active": True},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[USER_MGMT] [API] Response: {activate_response.status_code} {activate_response.reason}")
            
            if activate_response.status_code in [204, 200]:
                print(f"[USER_MGMT] ✓ Пользователь {email} активирован")
                return True
            else:
                print(f"[USER_MGMT] ✗ Не удалось активировать пользователя {email}: {activate_response.status_code}")
                if DEBUG_API_CALLS:
                    try:
                        print(f"[USER_MGMT] [API] Error response: {activate_response.text[:500]}")
                    except:
                        pass
                return False
                
        except Exception as e:
            print(f"[USER_MGMT] Ошибка при активации пользователя {email}: {e}")
            return False
