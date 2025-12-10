import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/services/auth.service';
import type RootStore from './RootStore';
import type { User, LoginRequest, RegisterRequest, OAuthProvider } from '../types/api.types';
import { saveToken, deleteToken, getToken } from '../api/axios.config';

class AuthStore {
  rootStore: RootStore;

  // State
  user: User | null = null;
  token: string | null = null;
  isAuthenticated: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  initializing: boolean = true;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    makePersistable(this, {
      name: 'AuthStore',
      properties: ['token', 'user', 'isAuthenticated'],
      storage: AsyncStorage,
    });
  }

  // Actions
  async login(credentials: LoginRequest) {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.login(credentials);

      console.log('Login response:', JSON.stringify(response.data, null, 2));

      runInAction(() => {
        this.token = String(response.data.jwtToken);
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.error = null;
      });

      await saveToken(String(response.data.jwtToken));

      // User is already in login response, no need to call getUser separately
      // But keeping it for consistency with old flow (can be removed in future)
      // await this.getUser();

      // Check if user has profile (не сбрасываем loading до завершения проверки профиля)
      await this.rootStore.profileStore.checkProfile();

      // Register for push notifications
      this.rootStore.notificationStore.registerForPushNotifications().catch((err) => {
        console.warn('Failed to register for push notifications:', err);
        // Не прерываем процесс входа, если регистрация уведомлений не удалась
      });

      runInAction(() => {
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        console.log('error' + error);

        this.error = error.response?.data?.message || 'Ошибка входа';
      });
      throw error;
    }
  }

  async register(userData: RegisterRequest) {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.register(userData);

      runInAction(() => {
        this.user = response.data;
        this.loading = false;
        this.error = null;
      });

      // После успешной регистрации автоматически входим в систему
      await this.login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка регистрации';
      });
      throw error;
    }
  }

  async loginWithOAuth(provider: OAuthProvider, idToken: string, authorizationCode?: string) {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.oauth({
        provider,
        idToken,
        authorizationCode,
      });

      runInAction(() => {
        this.token = response.data.jwtToken;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.error = null;
      });

      await saveToken(response.data.jwtToken);

      // Check if user has profile
      await this.rootStore.profileStore.checkProfile();

      // Register for push notifications
      this.rootStore.notificationStore.registerForPushNotifications().catch((err) => {
        console.warn('Failed to register for push notifications:', err);
      });

      runInAction(() => {
        this.loading = false;
      });
    } catch (error: any) {
      let errorMessage = 'Ошибка OAuth авторизации';

      if (error.response?.status === 409) {
        errorMessage = error.response.data.message || 'Email уже зарегистрирован с другим провайдером';
      } else if (error.response?.status === 401) {
        errorMessage = 'Не удалось проверить токен. Попробуйте еще раз';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      runInAction(() => {
        this.loading = false;
        this.error = errorMessage;
      });
      throw error;
    }
  }

  async getUser() {
    if (!this.token) {
      if (__DEV__) {
        console.log('[getUser] No token, skipping');
      }
      return;
    }

    if (__DEV__) {
      console.log('[getUser] Making request to /auth/user');
    }

    try {
      const response = await authService.getUser();

      runInAction(() => {
        this.user = response.data;
      });
      
      if (__DEV__) {
        console.log('[getUser] Success, user:', this.user?.email);
      }
    } catch (error: any) {
      // 404 или 401 на /auth/user - критическая ошибка
      // Пользователь не найден или токен невалиден
      if (error.response?.status === 404 || error.response?.status === 401) {
        if (__DEV__) {
          console.log(`[getUser] Critical error: ${error.response?.status}`);
        }
        // Очищаем состояние пользователя при критической ошибке
        runInAction(() => {
          this.user = null;
        });
        throw error;
      }
      // Другие ошибки логируем, но не прерываем работу
      console.error('[getUser] Error getting user:', error);
    }
  }

  async logout() {
    runInAction(() => {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;
    });

    await deleteToken();

    // Reset all stores
    this.rootStore.reset();
  }

  async checkAuth() {
    runInAction(() => {
      this.initializing = true;
    });

    // Load token from SecureStore
    const storedToken = await getToken();

    if (__DEV__) {
      console.log('[checkAuth] Token exists:', !!storedToken);
    }

    if (storedToken) {
      runInAction(() => {
        this.token = storedToken;
      });

      try {
        if (__DEV__) {
          console.log('[checkAuth] Calling getUser()');
        }
        await this.getUser();
        
        // Проверяем, что getUser() успешно установил данные пользователя
        // Если user не установлен, считаем это ошибкой аутентификации
        if (!this.user) {
          if (__DEV__) {
            console.log('[checkAuth] User data not available after getUser()');
          }
          throw new Error('User data not available after getUser()');
        }
        
        // Проверяем, что токен все еще существует (не был удален interceptor'ом)
        const tokenStillExists = await getToken();
        if (!tokenStillExists) {
          if (__DEV__) {
            console.log('[checkAuth] Token was deleted during authentication check');
          }
          throw new Error('Token was deleted during authentication check');
        }
        
        // Вызываем checkProfile() ТОЛЬКО если getUser() успешен и токен валиден
        if (__DEV__) {
          console.log('[checkAuth] Calling checkProfile()');
        }
        await this.rootStore.profileStore.checkProfile();
        
        // Устанавливаем isAuthenticated только если getUser() успешно вернул данные
        // Это гарантирует, что пользователь действительно существует и токен валиден
        runInAction(() => {
          this.isAuthenticated = true;
        });
        
        if (__DEV__) {
          console.log('[checkAuth] Authentication successful');
        }
      } catch (error) {
        console.error('[checkAuth] Auth check failed:', error);
        await this.logout();
      }
    } else {
      if (__DEV__) {
        console.log('[checkAuth] No token found, user not authenticated');
      }
      // Если токена нет, убеждаемся, что состояние сброшено
      runInAction(() => {
        this.isAuthenticated = false;
        this.user = null;
      });
    }

    runInAction(() => {
      this.initializing = false;
    });
  }

  setToken(token: string) {
    this.token = token;
    this.isAuthenticated = true;
  }

  setError(error: string | null) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  reset() {
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
    this.loading = false;
    this.error = null;
    this.initializing = false;
  }
}

export default AuthStore;
