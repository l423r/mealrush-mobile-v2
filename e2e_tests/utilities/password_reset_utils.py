"""
Утилита для работы с password reset API в тестах
"""
import os
import requests
import time
from typing import Optional, Dict, Any

# URL бекенда из переменных окружения
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8083/my-food')
RESET_PASSWORD_ENDPOINT = f"{BACKEND_API_URL}/auth/reset-password"
VALIDATE_RESET_TOKEN_ENDPOINT = f"{BACKEND_API_URL}/auth/reset-password/validate"
COMPLETE_PASSWORD_RESET_ENDPOINT = f"{BACKEND_API_URL}/auth/reset-password/complete"

# Включить подробное логирование API запросов
DEBUG_API_CALLS = os.getenv('DEBUG_API_CALLS', 'true').lower() == 'true'


class PasswordResetUtils:
    """Класс для работы с password reset API в тестах"""
    
    @staticmethod
    def request_password_reset(email: str) -> Optional[Dict[str, Any]]:
        """
        Запрашивает сброс пароля
        
        Args:
            email: Email пользователя
            
        Returns:
            Response объект или None
        """
        try:
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] [API] POST {RESET_PASSWORD_ENDPOINT} (request password reset for {email})")
            
            response = requests.post(
                RESET_PASSWORD_ENDPOINT,
                json={"email": email},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] [API] Response: {response.status_code} {response.reason}")
                if response.status_code == 200:
                    try:
                        print(f"[PASSWORD_RESET_UTILS] [API] Response body: {response.json()}")
                    except:
                        pass
            
            if response.status_code == 200:
                return response.json()
            return None
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] Ошибка при запросе сброса пароля: {e}")
            return None
    
    @staticmethod
    def validate_reset_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Валидирует токен сброса пароля
        
        Args:
            token: Токен сброса пароля
            
        Returns:
            Response объект или None
        """
        try:
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] [API] POST {VALIDATE_RESET_TOKEN_ENDPOINT} (validate reset token)")
            
            response = requests.post(
                VALIDATE_RESET_TOKEN_ENDPOINT,
                json={"token": token},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] [API] Response: {response.status_code} {response.reason}")
                try:
                    print(f"[PASSWORD_RESET_UTILS] [API] Response body: {response.json()}")
                except:
                    pass
            
            if response.status_code == 200:
                return response.json()
            return None
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] Ошибка при валидации токена: {e}")
            return None
    
    @staticmethod
    def complete_password_reset(token: str, new_password: str) -> Optional[Dict[str, Any]]:
        """
        Завершает сброс пароля
        
        Args:
            token: Токен сброса пароля
            new_password: Новый пароль
            
        Returns:
            Response объект или None
        """
        try:
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] [API] POST {COMPLETE_PASSWORD_RESET_ENDPOINT} (complete password reset)")
            
            response = requests.post(
                COMPLETE_PASSWORD_RESET_ENDPOINT,
                json={"token": token, "newPassword": new_password},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] [API] Response: {response.status_code} {response.reason}")
                try:
                    print(f"[PASSWORD_RESET_UTILS] [API] Response body: {response.json()}")
                except:
                    pass
            
            if response.status_code == 200:
                return response.json()
            return None
            
        except Exception as e:
            if DEBUG_API_CALLS:
                print(f"[PASSWORD_RESET_UTILS] Ошибка при завершении сброса пароля: {e}")
            return None
    
    @staticmethod
    def extract_reset_token_from_logs() -> Optional[str]:
        """
        Извлекает токен из логов (для dev mode)
        В реальных тестах токен должен извлекаться из email или передаваться напрямую
        
        Note: В dev mode токен может логироваться в консоль backend
        Это вспомогательный метод для тестирования - в production токен передается через email
        """
        # В production тестах токен должен извлекаться из email
        # Этот метод - заглушка для тестирования в dev mode
        if DEBUG_API_CALLS:
            print("[PASSWORD_RESET_UTILS] ⚠️ extract_reset_token_from_logs() не реализован - токен должен передаваться из email в тестах")
        return None
