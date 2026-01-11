/**
 * Error message translation utility
 * Translates backend error messages (English) to user-friendly Russian messages
 */

const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Authentication errors
  'Invalid email or password': 'Неверный email или пароль',
  'Email is required': 'Email обязателен',
  'Password is required': 'Пароль обязателен',
  'Invalid or expired token': 'Токен недействителен или истек',
  'Token validation failed': 'Ошибка проверки токена',
  'Unauthorized': 'Необходима авторизация',
  
  // Registration errors
  'Email already registered': 'Email уже зарегистрирован',
  'Email already exists': 'Email уже существует',
  
  // OAuth errors
  'This account is linked to': 'Эта учетная запись привязана к',
  'Please use': 'Используйте',
  'to sign in': 'для входа',
  'Google Sign In is not configured on this server': 'Google Sign In не настроен на сервере',
  'Apple Sign In is not configured on this server': 'Apple Sign In не настроен на сервере',
  'Unsupported OAuth provider': 'Неподдерживаемый OAuth провайдер',
  'Email already registered with': 'Email уже зарегистрирован с',
  'Token verification failed': 'Ошибка проверки токена',
  
  // Password reset errors
  'Invalid or expired password reset token': 'Токен сброса пароля недействителен или истек',
  'Password reset token is invalid or expired': 'Токен сброса пароля недействителен или истек',
  'Token is valid': 'Токен действителен',
  'Password has been reset successfully': 'Пароль успешно изменен',
  
  // General errors
  'User not found': 'Пользователь не найден',
  'Authentication required': 'Требуется аутентификация',
  'Bad request': 'Неверный запрос',
  'Internal server error': 'Внутренняя ошибка сервера',
  'Network error': 'Ошибка сети',
  'Request timeout': 'Превышено время ожидания',
};

/**
 * Translates backend error message to Russian
 * Falls back to original message if translation not found
 * 
 * @param errorMessage - Error message from backend (usually in English)
 * @returns Translated error message in Russian or original if translation not found
 */
export function translateErrorMessage(errorMessage: string | null | undefined): string {
  if (!errorMessage) {
    return 'Произошла ошибка';
  }

  // Try exact match first
  if (ERROR_MESSAGE_MAP[errorMessage]) {
    return ERROR_MESSAGE_MAP[errorMessage];
  }

  // Try case-insensitive match
  const lowerErrorMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (key.toLowerCase() === lowerErrorMessage) {
      return value;
    }
  }

      // Try partial match for complex messages (e.g., "This account is linked to Google. Please use Google to sign in")
      for (const [key, value] of Object.entries(ERROR_MESSAGE_MAP)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
          // For OAuth messages, try to preserve provider name
          if (key.includes('linked to') || key.includes('Please use')) {
            // Extract provider name and construct full message
            const providerRegex = /(?:linked to|use)\s+(\w+)/i;
            const providerMatch = providerRegex.exec(errorMessage);
            if (providerMatch && providerMatch[1]) {
              const provider = providerMatch[1];
              return `Эта учетная запись привязана к ${provider}. Используйте ${provider} для входа`;
            }
          }
          return value;
        }
      }

  // Fallback: return original message (might be already in Russian or needs manual translation)
  return errorMessage;
}

/**
 * Gets a default error message for a given error type
 */
export function getDefaultErrorMessage(
  errorType: 'login' | 'register' | 'resetPassword' | 'completePasswordReset' | 'general'
): string {
  switch (errorType) {
    case 'login':
      return 'Не удалось войти в систему';
    case 'register':
      return 'Не удалось зарегистрироваться';
    case 'resetPassword':
      return 'Не удалось отправить запрос на сброс пароля';
    case 'completePasswordReset':
      return 'Не удалось изменить пароль';
    default:
      return 'Произошла ошибка';
  }
}
