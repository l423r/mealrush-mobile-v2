import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  NotificationPreferences,
  NotificationPreferencesUpdateRequest,
} from '../../types/api.types';

export const notificationService = {
  /**
   * Регистрация устройства для получения push-уведомлений
   */
  registerDevice: (data: DeviceRegistrationRequest) =>
    apiClient.post<DeviceRegistrationResponse>(
      MY_FOOD_ENDPOINTS.NOTIFICATIONS_REGISTER,
      data
    ),

  /**
   * Удаление устройства из уведомлений
   */
  unregisterDevice: (deviceToken: string) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.NOTIFICATIONS_DEVICE}/${deviceToken}`),

  /**
   * Получение настроек уведомлений (создает defaults при первом запросе)
   */
  getPreferences: () =>
    apiClient.get<NotificationPreferences>(
      MY_FOOD_ENDPOINTS.NOTIFICATIONS_PREFERENCES
    ),

  /**
   * Обновление настроек уведомлений (PATCH - partial update)
   */
  updatePreferences: (data: NotificationPreferencesUpdateRequest) =>
    apiClient.patch<NotificationPreferences>(
      MY_FOOD_ENDPOINTS.NOTIFICATIONS_PREFERENCES,
      data
    ),

  /**
   * Сброс настроек к defaults (POST /reset - возвращает новые defaults сразу)
   */
  resetPreferences: () =>
    apiClient.post<NotificationPreferences>(
      MY_FOOD_ENDPOINTS.NOTIFICATIONS_PREFERENCES_RESET
    ),
};

