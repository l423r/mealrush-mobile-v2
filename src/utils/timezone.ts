/**
 * Получить часовой пояс устройства в формате IANA
 * @returns {string} Часовой пояс устройства (например, "Europe/Moscow", "America/New_York")
 */
export const getDeviceTimezone = (): string => {
  try {
    // Используем Intl API для получения часового пояса устройства
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'UTC'; // Возвращаем UTC как fallback
  } catch (error) {
    console.error('Error getting device timezone:', error);
    return 'UTC'; // Возвращаем UTC в случае ошибки
  }
};

/**
 * Проверить, валиден ли часовой пояс в формате IANA
 * @param {string} timezone - Часовой пояс для проверки
 * @returns {boolean} true если часовой пояс валиден
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Популярные часовые пояса для выбора
 */
export const POPULAR_TIMEZONES = [
  { value: 'Europe/Moscow', label: 'Москва (GMT+3)' },
  { value: 'Europe/Kaliningrad', label: 'Калининград (GMT+2)' },
  { value: 'Europe/Samara', label: 'Самара (GMT+4)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (GMT+5)' },
  { value: 'Asia/Omsk', label: 'Омск (GMT+6)' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск (GMT+7)' },
  { value: 'Asia/Irkutsk', label: 'Иркутск (GMT+8)' },
  { value: 'Asia/Yakutsk', label: 'Якутск (GMT+9)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (GMT+10)' },
  { value: 'Asia/Magadan', label: 'Магадан (GMT+11)' },
  { value: 'Asia/Kamchatka', label: 'Камчатка (GMT+12)' },
  { value: 'Europe/London', label: 'Лондон (GMT+0)' },
  { value: 'Europe/Berlin', label: 'Берлин (GMT+1)' },
  { value: 'America/New_York', label: 'Нью-Йорк (GMT-5)' },
  { value: 'America/Chicago', label: 'Чикаго (GMT-6)' },
  { value: 'America/Los_Angeles', label: 'Лос-Анджелес (GMT-8)' },
  { value: 'Asia/Tokyo', label: 'Токио (GMT+9)' },
  { value: 'Asia/Shanghai', label: 'Шанхай (GMT+8)' },
  { value: 'Asia/Dubai', label: 'Дубай (GMT+4)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
] as const;

