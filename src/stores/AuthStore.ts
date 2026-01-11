import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/services/auth.service';
import type RootStore from './RootStore';
import type { User, LoginRequest, RegisterRequest, OAuthProvider } from '../types/api.types';
import { saveToken, saveTokens, deleteTokens, getToken, getRefreshToken } from '../api/axios.config';
import { translateErrorMessage, getDefaultErrorMessage } from '../utils/errorMessages';

class AuthStore {
  rootStore: RootStore;

  // State
  user: User | null = null;
  token: string | null = null; // Access token (short-lived: 15 minutes)
  refreshToken: string | null = null; // Refresh token (long-lived: 90 days)
  isAuthenticated: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  initializing: boolean = true;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    makePersistable(this, {
      name: 'AuthStore',
      properties: ['user', 'isAuthenticated'], // Security: Tokens are stored ONLY in SecureStore, not AsyncStorage
      storage: AsyncStorage,
    });
  }

  // Actions
  async login(credentials: LoginRequest) {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.login(credentials);

      if (__DEV__) {
        // Security: Never log token values
        const safeResponse = { ...response.data, jwtToken: '[REDACTED]' };
        console.log('Login response:', JSON.stringify(safeResponse, null, 2));
      }

      runInAction(() => {
        this.token = String(response.data.jwtToken);
        this.refreshToken = response.data.refreshToken ? String(response.data.refreshToken) : null;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.error = null;
      });

      // Save both access token and refresh token securely
      if (response.data.refreshToken) {
        await saveTokens(String(response.data.jwtToken), String(response.data.refreshToken));
      } else {
        // Fallback: if refresh token is missing, only save access token (should not happen)
        await saveToken(String(response.data.jwtToken));
        if (__DEV__) {
          console.warn('[AuthStore] Login response missing refresh token');
        }
      }

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
        if (__DEV__) {
          console.error('Login error:', error.response?.data || error.message);
        }

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
        // Translate backend error message to Russian
        const backendMessage = error.response?.data?.message;
        this.error = translateErrorMessage(backendMessage) || getDefaultErrorMessage('register');
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
        this.refreshToken = response.data.refreshToken ? String(response.data.refreshToken) : null;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.error = null;
      });

      // Save both access token and refresh token securely
      if (response.data.refreshToken) {
        await saveTokens(response.data.jwtToken, String(response.data.refreshToken));
      } else {
        // Fallback: if refresh token is missing, only save access token (should not happen)
        await saveToken(response.data.jwtToken);
        if (__DEV__) {
          console.warn('[AuthStore] OAuth response missing refresh token');
        }
      }

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
      // Translate backend error message to Russian
      const backendMessage = error.response?.data?.message;
      let errorMessage = translateErrorMessage(backendMessage);
      
      // Fallback to status-specific messages if translation not found
      if (!errorMessage) {
        if (error.response?.status === 409) {
          errorMessage = 'Email уже зарегистрирован с другим провайдером';
        } else if (error.response?.status === 401) {
          errorMessage = 'Не удалось проверить токен. Попробуйте еще раз';
        } else {
          errorMessage = 'Ошибка OAuth авторизации';
        }
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
    try {
      // Revoke refresh tokens on server (best practice: invalidate all sessions)
      // Only call logout API if we have a valid access token
      if (this.token) {
        try {
          await authService.logout();
          if (__DEV__) {
            console.log('[AuthStore] Logout API called successfully');
          }
        } catch (error: any) {
          // If logout API fails (e.g., token expired), continue with local logout
          if (__DEV__) {
            console.warn('[AuthStore] Logout API failed, continuing with local logout:', error.message);
          }
        }
      }
    } catch (error) {
      // Continue with local logout even if API call fails
      if (__DEV__) {
        console.warn('[AuthStore] Error during logout API call:', error);
      }
    }

    runInAction(() => {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.error = null;
    });

    // Clear all tokens from SecureStore (security: invalidate all sessions)
    await deleteTokens();

    // Reset all stores
    this.rootStore.reset();
  }

  async checkAuth() {
    runInAction(() => {
      this.initializing = true;
    });

    // Load tokens from SecureStore
    const storedToken = await getToken();
    const storedRefreshToken = await getRefreshToken();

    if (__DEV__) {
      console.log('[checkAuth] Access token exists:', !!storedToken);
      console.log('[checkAuth] Refresh token exists:', !!storedRefreshToken);
    }

    if (storedToken) {
      runInAction(() => {
        this.token = storedToken;
        this.refreshToken = storedRefreshToken;
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
        
        // Проверяем, что токены все еще существуют (не были удалены interceptor'ом)
        const tokenStillExists = await getToken();
        const refreshTokenStillExists = await getRefreshToken();
        if (!tokenStillExists || !refreshTokenStillExists) {
          if (__DEV__) {
            console.log('[checkAuth] Tokens were deleted during authentication check');
          }
          throw new Error('Tokens were deleted during authentication check');
        }
        
        // Update state with tokens from SecureStore (they might have been refreshed by interceptor)
        runInAction(() => {
          this.token = tokenStillExists;
          this.refreshToken = refreshTokenStillExists;
        });
        
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

  async requestPasswordReset(email: string) {
    this.loading = true;
    this.error = null;

    try {
      await authService.resetPassword(email);
      // Always return success (security: prevents email enumeration)
      runInAction(() => {
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        // Translate backend error message to Russian
        const backendMessage = error.response?.data?.message;
        this.error = translateErrorMessage(backendMessage) || getDefaultErrorMessage('resetPassword');
      });
      throw error;
    }
  }

  async validateResetToken(token: string): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const response = await authService.validateResetToken(token);
      runInAction(() => {
        this.loading = false;
        this.error = null;
      });
      // Token is valid if response status is 200
      return response.status === 200;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        // Translate backend error message to Russian
        const backendMessage = error.response?.data?.message;
        this.error = translateErrorMessage(backendMessage) || 'Токен недействителен или истек';
      });
      // Token is invalid if we get an error
      return false;
    }
  }

  async completePasswordReset(token: string, newPassword: string) {
    this.loading = true;
    this.error = null;

    try {
      await authService.completePasswordReset(token, newPassword);
      runInAction(() => {
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        // Translate backend error message to Russian
        const backendMessage = error.response?.data?.message;
        this.error = translateErrorMessage(backendMessage) || getDefaultErrorMessage('completePasswordReset');
      });
      throw error;
    }
  }

  reset() {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this.loading = false;
    this.error = null;
    this.initializing = false;
  }
}

export default AuthStore;
