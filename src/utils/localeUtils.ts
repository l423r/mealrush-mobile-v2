/**
 * Утилиты для работы с локалью устройства
 */

/**
 * Получить язык устройства
 * @returns {string} Код языка ('ru' или 'en')
 */
export const getDeviceLanguage = (): 'ru' | 'en' => {
  try {
    // Получаем локаль устройства через Intl API
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    
    // Извлекаем код языка (первые 2 символа, например 'ru' из 'ru-RU')
    const languageCode = locale.split('-')[0].toLowerCase();
    
    // Список русскоязычных локалей
    const russianLocales = ['ru', 'be', 'uk', 'kk', 'ky', 'tg', 'uz'];
    
    // Если язык в списке русскоязычных - возвращаем 'ru', иначе 'en'
    return russianLocales.includes(languageCode) ? 'ru' : 'en';
  } catch (error) {
    console.error('Error getting device language:', error);
    // По умолчанию русский (основная аудитория)
    return 'ru';
  }
};

/**
 * Получить полную локаль устройства
 * @returns {string} Полная локаль (например, 'ru-RU', 'en-US')
 */
export const getDeviceLocale = (): string => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale || 'ru-RU';
  } catch (error) {
    console.error('Error getting device locale:', error);
    return 'ru-RU';
  }
};

/**
 * Проверить, русскоязычный ли пользователь
 * @returns {boolean} true если локаль русскоязычная
 */
export const isRussianLocale = (): boolean => {
  return getDeviceLanguage() === 'ru';
};

