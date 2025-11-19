import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
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
      ApiRoutes.Notifications.Register,
      data
    ),

  /**
   * Удаление устройства из уведомлений
   */
  unregisterDevice: (deviceToken: string) =>
    apiClient.delete(`${ApiRoutes.Notifications.Device}/${deviceToken}`),

  /**
   * Получение настроек уведомлений (создает defaults при первом запросе)
   */
  getPreferences: () =>
    apiClient.get<NotificationPreferences>(
      ApiRoutes.Notifications.Preferences
    ),

  /**
   * Обновление настроек уведомлений (PATCH - partial update)
   */
  updatePreferences: (data: NotificationPreferencesUpdateRequest) =>
    apiClient.patch<NotificationPreferences>(
      ApiRoutes.Notifications.Preferences,
      data
    ),

  /**
   * Сброс настроек к defaults (POST /reset - возвращает новые defaults сразу)
   */
  resetPreferences: () =>
    apiClient.post<NotificationPreferences>(
      ApiRoutes.Notifications.ResetPreferences
    ),
};

