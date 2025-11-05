import { makeAutoObservable, runInAction } from 'mobx';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type RootStore from './RootStore';
import { notificationService } from '../api/services/notification.service';
import type {
  DeviceType,
  NotificationPreferences,
  NotificationPreferencesUpdateRequest,
} from '../types/api.types';

// Конфигурация поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationStore {
  rootStore: RootStore;
  
  // Device registration state
  fcmToken: string | null = null;
  expoPushToken: string | null = null;
  loading: boolean = false;
  error: string | null = null;
  notificationsEnabled: boolean = false;
  permissionStatus: 'granted' | 'denied' | 'undetermined' = 'undetermined';
  
  // Notification preferences state (NEW v2.4.0)
  preferences: NotificationPreferences | null = null;
  preferencesLoading: boolean = false;
  preferencesError: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  /**
   * Регистрация для получения push-уведомлений
   */
  async registerForPushNotifications(): Promise<boolean> {
    console.log('🔔 Starting push notification registration...');
    this.loading = true;
    this.error = null;

    try {
      // Проверка устройства
      console.log('📱 Device.isDevice:', Device.isDevice);
      console.log('📱 Platform:', Platform.OS);
      
      if (!Device.isDevice) {
        const errorMsg = 'Пуш-уведомления работают только на физических устройствах';
        console.log('⚠️', errorMsg);
        console.warn(errorMsg);
        runInAction(() => {
          this.error = errorMsg;
          this.loading = false;
        });
        return false;
      }

      console.log('✅ Device check passed');

      // Запрос разрешения на уведомления
      console.log('🔑 Requesting notification permissions...');
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      console.log('📋 Existing permission status:', existingStatus);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('❓ Permission not granted, requesting...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('📋 New permission status:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Permission denied');
        runInAction(() => {
          this.error = 'Разрешение на уведомления не предоставлено';
          this.permissionStatus = 'denied';
          this.loading = false;
        });
        return false;
      }

      console.log('✅ Permission granted!');
      runInAction(() => {
        this.permissionStatus = 'granted';
      });

      // Получение FCM Token (для Android)
      if (Platform.OS === 'android') {
        const devicePushToken = await Notifications.getDevicePushTokenAsync();
        const token = devicePushToken.data;

        runInAction(() => {
          this.fcmToken = token;
          this.notificationsEnabled = true;
        });

        // Отправка токена на бэкенд
        await this.sendTokenToBackend(token, 'ANDROID');
      } else if (Platform.OS === 'ios') {
        const devicePushToken = await Notifications.getDevicePushTokenAsync();
        const token = devicePushToken.data;

        runInAction(() => {
          this.fcmToken = token;
          this.notificationsEnabled = true;
        });

        // Отправка токена на бэкенд
        await this.sendTokenToBackend(token, 'IOS');
      }

      runInAction(() => {
        this.loading = false;
      });

      console.log('Push notification token registered:', this.fcmToken);
      
      // После успешной регистрации загружаем preferences
      await this.fetchPreferences();
      
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.message || 'Ошибка регистрации уведомлений';
      });
      console.error('Error registering for push notifications:', error);
      return false;
    }
  }

  /**
   * Отправка токена на бэкенд
   */
  private async sendTokenToBackend(
    token: string,
    deviceType: DeviceType
  ): Promise<void> {
    try {
      await notificationService.registerDevice({
        fcmToken: token,
        deviceType: deviceType,
      });
      console.log('Token successfully sent to backend');
    } catch (error: any) {
      console.error('Error sending token to backend:', error);
      // Не выбрасываем ошибку, чтобы не прерывать процесс регистрации
      // Токен сохранён локально и можно попробовать отправить позже
    }
  }

  /**
   * Настройка слушателей уведомлений
   */
  setupNotificationListeners(): () => void {
    // Обработка уведомлений когда приложение открыто
    const notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
        // Можно показать in-app уведомление или обновить UI
      });

    // Обработка нажатия на уведомление
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification tapped:', response);
        // Здесь можно добавить навигацию к нужному экрану
        // Например, если в data есть route: navigation.navigate(route)
        const data = response.notification.request.content.data;
        console.log('Notification data:', data);
      });

    // Возвращаем функцию для очистки слушателей
    return () => {
      // Правильный способ удаления подписок
      notificationListener.remove();
      responseListener.remove();
    };
  }

  /**
   * Переключение уведомлений
   */
  async toggleNotifications(): Promise<void> {
    if (this.notificationsEnabled) {
      await this.disableNotifications();
    } else {
      await this.registerForPushNotifications();
    }
  }

  /**
   * Отключение уведомлений
   */
  async disableNotifications(): Promise<void> {
    try {
      if (this.fcmToken) {
        // Удаляем токен с бэкенда
        await notificationService.unregisterDevice(this.fcmToken);
      }
      runInAction(() => {
        this.notificationsEnabled = false;
        this.fcmToken = null;
        this.expoPushToken = null;
      });
      console.log('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  /**
   * Проверка статуса разрешений
   */
  async checkPermissionStatus(): Promise<void> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      runInAction(() => {
        this.permissionStatus = status as 'granted' | 'denied' | 'undetermined';
      });
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  }

  /**
   * Сброс состояния (при выходе из аккаунта)
   */
  reset(): void {
    this.fcmToken = null;
    this.expoPushToken = null;
    this.loading = false;
    this.error = null;
    this.notificationsEnabled = false;
    this.permissionStatus = 'undetermined';
    
    // Reset preferences state
    this.preferences = null;
    this.preferencesLoading = false;
    this.preferencesError = null;
  }

  // ==========================================
  // NOTIFICATION PREFERENCES (API v2.4.0)
  // ==========================================

  /**
   * Загрузка настроек уведомлений
   * При первом запросе сервер автоматически создаст defaults
   */
  async fetchPreferences(): Promise<void> {
    this.preferencesLoading = true;
    this.preferencesError = null;

    try {
      const response = await notificationService.getPreferences();
      runInAction(() => {
        this.preferences = response.data;
        this.preferencesLoading = false;
      });
      console.log('✅ Notification preferences loaded');
    } catch (error: any) {
      runInAction(() => {
        this.preferencesLoading = false;
        this.preferencesError =
          error.response?.data?.message || 'Ошибка загрузки настроек уведомлений';
      });
      console.error('Error fetching notification preferences:', error);
    }
  }

  /**
   * Обновление настроек уведомлений (PATCH - partial update)
   */
  async updatePreferences(
    updates: NotificationPreferencesUpdateRequest
  ): Promise<boolean> {
    this.preferencesLoading = true;
    this.preferencesError = null;

    try {
      const response = await notificationService.updatePreferences(updates);
      runInAction(() => {
        this.preferences = response.data;
        this.preferencesLoading = false;
      });
      console.log('✅ Notification preferences updated');
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.preferencesLoading = false;
        this.preferencesError =
          error.response?.data?.message || 'Ошибка обновления настроек';
      });
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Сброс настроек к defaults (POST /reset)
   */
  async resetPreferences(): Promise<boolean> {
    this.preferencesLoading = true;
    this.preferencesError = null;

    try {
      const response = await notificationService.resetPreferences();
      runInAction(() => {
        this.preferences = response.data;
        this.preferencesLoading = false;
      });
      console.log('✅ Notification preferences reset to defaults');
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.preferencesLoading = false;
        this.preferencesError =
          error.response?.data?.message || 'Ошибка сброса настроек';
      });
      console.error('Error resetting notification preferences:', error);
      return false;
    }
  }

  /**
   * Переключение globallyEnabled (master switch)
   */
  async toggleGloballyEnabled(): Promise<boolean> {
    if (!this.preferences) return false;

    return await this.updatePreferences({
      globallyEnabled: !this.preferences.globallyEnabled,
    });
  }

  /**
   * Переключение уведомления для конкретного приема пищи
   * Для snack/lateSnack требуется время при включении
   */
  async toggleMealNotification(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'lateSnack'
  ): Promise<boolean> {
    if (!this.preferences) return false;

    const currentValue = this.preferences[mealType].enabled;
    
    // При выключении просто переключаем enabled
    if (currentValue) {
      return await this.updatePreferences({
        [mealType]: { enabled: false },
      });
    }
    
    // При включении snack/lateSnack нужно сначала показать диалог
    // Метод должен вызываться только для breakfast/lunch/dinner
    // Для snack/lateSnack используем enableSnack/enableLateSnack
    if (mealType === 'snack' || mealType === 'lateSnack') {
      throw new Error(`Use enableSnack/enableLateSnack for ${mealType}`);
    }

    return await this.updatePreferences({
      [mealType]: { enabled: true },
    });
  }

  /**
   * Включение snack с указанием времени (обязательно)
   */
  async enableSnack(time: string, minutesBefore: number): Promise<boolean> {
    // Валидация
    if (!time || !minutesBefore) {
      this.preferencesError = 'Укажите время и интервал напоминания';
      return false;
    }

    if (minutesBefore < 5 || minutesBefore > 120) {
      this.preferencesError = 'Интервал должен быть от 5 до 120 минут';
      return false;
    }

    return await this.updatePreferences({
      snack: {
        enabled: true,
        time,
        minutesBefore,
      },
    });
  }

  /**
   * Включение lateSnack с указанием времени (обязательно)
   */
  async enableLateSnack(time: string, minutesBefore: number): Promise<boolean> {
    // Валидация
    if (!time || !minutesBefore) {
      this.preferencesError = 'Укажите время и интервал напоминания';
      return false;
    }

    if (minutesBefore < 5 || minutesBefore > 120) {
      this.preferencesError = 'Интервал должен быть от 5 до 120 минут';
      return false;
    }

    return await this.updatePreferences({
      lateSnack: {
        enabled: true,
        time,
        minutesBefore,
      },
    });
  }

  /**
   * Обновление времени приема пищи
   */
  async updateMealTime(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'lateSnack',
    time: string
  ): Promise<boolean> {
    return await this.updatePreferences({
      [mealType]: { time },
    });
  }

  /**
   * Обновление интервала напоминания
   */
  async updateMinutesBefore(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'lateSnack',
    minutesBefore: number
  ): Promise<boolean> {
    if (minutesBefore < 5 || minutesBefore > 120) {
      this.preferencesError = 'Интервал должен быть от 5 до 120 минут';
      return false;
    }

    return await this.updatePreferences({
      [mealType]: { minutesBefore },
    });
  }

  /**
   * Переключение уведомлений о достижениях
   */
  async toggleAchievements(): Promise<boolean> {
    if (!this.preferences) return false;

    return await this.updatePreferences({
      achievementsEnabled: !this.preferences.achievementsEnabled,
    });
  }
}

export default NotificationStore;

