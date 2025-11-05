import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
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
};

