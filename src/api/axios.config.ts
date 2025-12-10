import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import axios from 'axios';
import { API_BASE_URL, ApiRoutes, Timeouts } from './apiRoutes';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Timeouts.Default,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug logging in development
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
}

// Token management
const TOKEN_KEY = 'jwtToken';

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const saveToken = async (token: string): Promise<void> => {
  try {
    console.log('Saving token:', typeof token, token);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};

// Request interceptor - adds JWT token to all requests except public auth endpoints
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Log request details in development
    if (__DEV__) {
      console.log(
        `🌐 [REQUEST] ${config.method?.toUpperCase()} ${API_BASE_URL}${config.url}`
      );
      if (config.params) {
        console.log('Query params:', config.params);
      }
      if (config.data) {
        console.log('Request body:', config.data);
      }
    }

    // Skip adding token only for public auth endpoints (POST requests to login, register, reset password)
    const isPublicAuthEndpoint =
      config.method === 'post' &&
      (config.url === ApiRoutes.Auth.Register ||
        config.url === ApiRoutes.Auth.Login ||
        config.url === ApiRoutes.Auth.ResetPassword);

    if (!isPublicAuthEndpoint) {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    throw error;
  }
);

// Response interceptor - handles token expiration
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response details in development
    if (__DEV__) {
      console.log(
        `✅ [RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  async (error) => {
    // Log error details in development
    if (__DEV__) {
      console.error(
        `❌ [ERROR] ${error.response?.status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`
      );
      if (error.response?.data) {
        console.error('Error response:', error.response.data);
      }
    }

    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toLowerCase();

    // 401 - токен истек или невалиден
    // 404 на /auth/user - пользователь не найден (токен невалиден или пользователь удален)
    if (
      status === 401 ||
      (status === 404 && url === ApiRoutes.Auth.User)
    ) {
      // Token expired, invalid, or user not found - delete token
      await deleteToken();
      // AuthStore.checkAuth() or getUser() will handle logout when error is thrown
    }

    // 403 - Forbidden (нет прав доступа)
    // Для GET /user-profile с 403 - это нормально (профиль не создан), не удаляем токен
    // Для POST/PUT /user-profile с 403 - токен невалиден, удаляем токен
    // Для эндпоинтов друзей (meal, nutrition, weight-history) с targetUserId - это нормально (нет прав доступа к данным друга), не удаляем токен
    // Для других эндпоинтов с 403 - токен невалиден, удаляем токен
    if (status === 403) {
      const isGetUserProfile = url === ApiRoutes.UserProfile && method === 'get';
      
      // Проверяем, является ли это запросом к эндпоинту друзей (с targetUserId в params)
      // Для POST запросов targetUserId может быть в params (query-параметры)
      const hasTargetUserId = error.config?.params?.targetUserId !== undefined;
      const isFriendsEndpoint = 
        (url?.includes('/meal') || 
         url?.includes('/meal_element') ||
         url?.includes('/nutrition') || 
         url?.includes('/weight-history')) &&
        hasTargetUserId;
      
      if (__DEV__) {
        console.log(`[Interceptor] 403 on ${method?.toUpperCase()} ${url}, isGetUserProfile: ${isGetUserProfile}, isFriendsEndpoint: ${isFriendsEndpoint}, hasTargetUserId: ${hasTargetUserId}`);
      }
      
      if (!isGetUserProfile && !isFriendsEndpoint) {
        // 403 на других эндпоинтах или POST/PUT /user-profile - токен невалиден
        if (__DEV__) {
          console.log('[Interceptor] Deleting token due to 403');
        }
        await deleteToken();
        // AuthStore.checkAuth() or соответствующий метод handle logout when error is thrown
      }
      // Для GET /user-profile с 403 не удаляем токен - это означает отсутствие профиля
      // Для эндпоинтов друзей с 403 не удаляем токен - это означает отсутствие прав доступа к данным друга
    }

    throw error;
  }
);
