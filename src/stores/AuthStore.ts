import { makeAutoObservable, runInAction } from 'mobx';
import { authService } from '../api/services/auth.service';
import type RootStore from './RootStore';
import type { User, LoginRequest, RegisterRequest } from '../types/api.types';
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
        this.isAuthenticated = true;
        this.error = null;
      });

      await saveToken(String(response.data.jwtToken));

      // Get user data
      await this.getUser();

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

  async getUser() {
    if (!this.token) return;

    try {
      const response = await authService.getUser();

      runInAction(() => {
        this.user = response.data;
      });
    } catch (error: any) {
      console.error('Error getting user:', error);
      // Don't throw error here to avoid breaking the app
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
    
    if (storedToken) {
      runInAction(() => {
        this.token = storedToken;
      });
      
      try {
        await this.getUser();
        await this.rootStore.profileStore.checkProfile();
        runInAction(() => {
          this.isAuthenticated = true;
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        await this.logout();
      }
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
