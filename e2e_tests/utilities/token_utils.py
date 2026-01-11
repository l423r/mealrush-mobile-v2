"""
Утилита для работы с токенами в тестах
"""
import os
import requests
import time
from typing import Optional, Dict, Any

# URL бекенда из переменных окружения
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8083/my-food')
AUTH_ENDPOINT = f"{BACKEND_API_URL}/auth/token"
REFRESH_ENDPOINT = f"{BACKEND_API_URL}/auth/refresh"
USER_ENDPOINT = f"{BACKEND_API_URL}/auth/user"

# Включить подробное логирование API запросов
DEBUG_API_CALLS = os.getenv('DEBUG_API_CALLS', 'true').lower() == 'true'


class TokenUtils:
    """Класс для работы с токенами в тестах"""
    
    @staticmethod
    def login_and_get_tokens(email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Логинится и получает токены
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            Словарь с токенами и информацией о пользователе или None
        """
        try:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] POST {AUTH_ENDPOINT} (login для получения токенов)")
            
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
                print(f"[TOKEN_UTILS] [API] Response: {login_response.status_code} {login_response.reason}")
            
            if login_response.status_code != 200:
                if DEBUG_API_CALLS:
                    try:
                        print(f"[TOKEN_UTILS] [API] Error response: {login_response.text[:500]}")
                    except:
                        pass
                return None
            
            token_data = login_response.json()
            
            # Извлекаем токены
            access_token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            refresh_token = token_data.get("refreshToken")
            expires_in = token_data.get("expiresIn")
            refresh_expires_in = token_data.get("refreshExpiresIn")
            user = token_data.get("user")
            
            if not access_token:
                if DEBUG_API_CALLS:
                    print(f"[TOKEN_UTILS] [API] Access token not found in response")
                return None
            
            result = {
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "expiresIn": expires_in,
                "refreshExpiresIn": refresh_expires_in,
                "user": user,
                "fullResponse": token_data
            }
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] Tokens получены успешно")
                print(f"[TOKEN_UTILS] [API] Access token length: {len(access_token)}")
                print(f"[TOKEN_UTILS] [API] Refresh token exists: {refresh_token is not None}")
                print(f"[TOKEN_UTILS] [API] Expires in: {expires_in} seconds")
                print(f"[TOKEN_UTILS] [API] Refresh expires in: {refresh_expires_in} seconds")
            
            return result
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] Ошибка при получении токенов: {e}")
            return None
    
    @staticmethod
    def refresh_token_with_status(refresh_token: str, device_info: Optional[str] = None, ip_address: Optional[str] = None) -> tuple[Optional[Dict[str, Any]], int]:
        """
        Обновляет access token используя refresh token и возвращает статус код
        
        Args:
            refresh_token: Refresh token
            device_info: Опциональная информация об устройстве
            ip_address: Опциональный IP адрес
            
        Returns:
            Tuple (словарь с новыми токенами или None, статус код ответа)
        """
        try:
            request_body = {
                "refreshToken": refresh_token
            }
            if device_info:
                request_body["deviceInfo"] = device_info
            if ip_address:
                request_body["ipAddress"] = ip_address
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] POST {REFRESH_ENDPOINT} (refresh token)")
            
            refresh_response = requests.post(
                REFRESH_ENDPOINT,
                json=request_body,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            status_code = refresh_response.status_code
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] Response: {status_code} {refresh_response.reason}")
            
            if status_code != 200:
                if DEBUG_API_CALLS:
                    try:
                        print(f"[TOKEN_UTILS] [API] Error response: {refresh_response.text[:500]}")
                    except:
                        pass
                return None, status_code
            
            token_data = refresh_response.json()
            
            # Извлекаем новые токены
            new_access_token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            new_refresh_token = token_data.get("refreshToken")
            expires_in = token_data.get("expiresIn")
            refresh_expires_in = token_data.get("refreshExpiresIn")
            user = token_data.get("user")
            
            if not new_access_token:
                if DEBUG_API_CALLS:
                    print(f"[TOKEN_UTILS] [API] New access token not found in response")
                return None, status_code
            
            result = {
                "accessToken": new_access_token,
                "refreshToken": new_refresh_token,
                "expiresIn": expires_in,
                "refreshExpiresIn": refresh_expires_in,
                "user": user,
                "fullResponse": token_data
            }
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] Tokens обновлены успешно")
                print(f"[TOKEN_UTILS] [API] New access token length: {len(new_access_token)}")
                print(f"[TOKEN_UTILS] [API] New refresh token exists: {new_refresh_token is not None}")
            
            return result, status_code
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] Ошибка при обновлении токена: {e}")
            return None, 0
    
    @staticmethod
    def refresh_token(refresh_token: str, device_info: Optional[str] = None, ip_address: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Обновляет access token используя refresh token
        
        Args:
            refresh_token: Refresh token
            device_info: Опциональная информация об устройстве
            ip_address: Опциональный IP адрес
            
        Returns:
            Словарь с новыми токенами или None
        """
        try:
            request_body = {
                "refreshToken": refresh_token
            }
            if device_info:
                request_body["deviceInfo"] = device_info
            if ip_address:
                request_body["ipAddress"] = ip_address
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] POST {REFRESH_ENDPOINT} (refresh token)")
            
            refresh_response = requests.post(
                REFRESH_ENDPOINT,
                json=request_body,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] Response: {refresh_response.status_code} {refresh_response.reason}")
            
            if refresh_response.status_code != 200:
                if DEBUG_API_CALLS:
                    try:
                        print(f"[TOKEN_UTILS] [API] Error response: {refresh_response.text[:500]}")
                    except:
                        pass
                return None
            
            token_data = refresh_response.json()
            
            # Извлекаем новые токены
            new_access_token = token_data.get("jwtToken") or token_data.get("token") or token_data.get("accessToken")
            new_refresh_token = token_data.get("refreshToken")
            expires_in = token_data.get("expiresIn")
            refresh_expires_in = token_data.get("refreshExpiresIn")
            user = token_data.get("user")
            
            if not new_access_token:
                if DEBUG_API_CALLS:
                    print(f"[TOKEN_UTILS] [API] New access token not found in response")
                return None
            
            result = {
                "accessToken": new_access_token,
                "refreshToken": new_refresh_token,
                "expiresIn": expires_in,
                "refreshExpiresIn": refresh_expires_in,
                "user": user,
                "fullResponse": token_data
            }
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] Tokens обновлены успешно")
                print(f"[TOKEN_UTILS] [API] New access token length: {len(new_access_token)}")
                print(f"[TOKEN_UTILS] [API] New refresh token exists: {new_refresh_token is not None}")
            
            return result
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] Ошибка при обновлении токена: {e}")
            return None
    
    @staticmethod
    def make_authenticated_request(url: str, access_token: str, method: str = "GET", **kwargs) -> Optional[requests.Response]:
        """
        Выполняет аутентифицированный запрос
        
        Args:
            url: URL для запроса
            access_token: Access token
            method: HTTP метод (GET, POST, PUT, DELETE)
            **kwargs: Дополнительные параметры для requests
            
        Returns:
            Response объект или None
        """
        try:
            headers = kwargs.get("headers", {})
            headers["Authorization"] = f"Bearer {access_token}"
            headers["Content-Type"] = headers.get("Content-Type", "application/json")
            kwargs["headers"] = headers
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] {method} {url} (authenticated request)")
            
            response = requests.request(method, url, timeout=10, **kwargs)
            
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] [API] Response: {response.status_code} {response.reason}")
            
            return response
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] Ошибка при выполнении запроса: {e}")
            return None
    
    @staticmethod
    def verify_token_valid(access_token: str) -> bool:
        """
        Проверяет, валиден ли токен (выполняет запрос к защищенному endpoint)
        
        Args:
            access_token: Access token для проверки
            
        Returns:
            True если токен валиден, False в противном случае
        """
        try:
            response = TokenUtils.make_authenticated_request(USER_ENDPOINT, access_token, "GET")
            
            if response is None:
                return False
            
            return response.status_code == 200
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] Ошибка при проверке токена: {e}")
            return False
    
    @staticmethod
    def verify_token_invalid(access_token: str) -> bool:
        """
        Проверяет, что токен невалиден (должен вернуть 401)
        
        Args:
            access_token: Access token для проверки
            
        Returns:
            True если токен невалиден (401), False в противном случае
        """
        try:
            response = TokenUtils.make_authenticated_request(USER_ENDPOINT, access_token, "GET")
            
            if response is None:
                return True  # Если запрос не выполнен, считаем токен невалидным
            
            return response.status_code == 401
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[TOKEN_UTILS] Ошибка при проверке токена: {e}")
            return True  # В случае ошибки считаем токен невалидным
