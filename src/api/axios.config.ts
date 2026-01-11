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
const ACCESS_TOKEN_KEY = 'jwtToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const saveToken = async (token: string): Promise<void> => {
  try {
    // Security: Never log token values, even in development
    if (__DEV__) {
      console.log('Saving access token: [REDACTED]');
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving access token:', error);
  }
};

export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    // Security: Never log token values, even in development
    if (__DEV__) {
      console.log('Saving refresh token: [REDACTED]');
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await Promise.all([
    saveToken(accessToken),
    saveRefreshToken(refreshToken),
  ]);
};

export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error deleting access token:', error);
  }
};

export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error deleting refresh token:', error);
  }
};

export const deleteTokens = async (): Promise<void> => {
  await Promise.all([
    deleteToken(),
    deleteRefreshToken(),
  ]);
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

    // Skip adding token only for public auth endpoints (POST requests to login, register, refresh, reset password, oauth)
    const isPublicAuthEndpoint =
      config.method === 'post' &&
      (config.url === ApiRoutes.Auth.Register ||
        config.url === ApiRoutes.Auth.Login ||
        config.url === ApiRoutes.Auth.Refresh ||
        config.url === ApiRoutes.Auth.ResetPassword ||
        config.url === ApiRoutes.Auth.ValidateResetToken ||
        config.url === ApiRoutes.Auth.CompletePasswordReset ||
        config.url === ApiRoutes.Auth.OAuth);

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

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toLowerCase();

    // 401 - access token expired or invalid
    // Best practice: Try to refresh token automatically (except for auth endpoints)
    if (status === 401 && url !== ApiRoutes.Auth.Refresh && !originalRequest._retry) {
      // Mark request as retried to prevent infinite loop
      originalRequest._retry = true;

      // Skip refresh for auth endpoints (login, register, refresh, oauth, reset password)
      const isAuthEndpoint = 
        url === ApiRoutes.Auth.Login ||
        url === ApiRoutes.Auth.Register ||
        url === ApiRoutes.Auth.OAuth ||
        url === ApiRoutes.Auth.Refresh ||
        url === ApiRoutes.Auth.ResetPassword ||
        url === ApiRoutes.Auth.ValidateResetToken ||
        url === ApiRoutes.Auth.CompletePasswordReset;

      if (!isAuthEndpoint) {
        // Try to refresh access token using refresh token
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken && originalRequest.headers) {
          // Retry original request with new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          if (__DEV__) {
            console.log('[Interceptor] Retrying request with new access token');
          }
          
          try {
            return await apiClient(originalRequest);
          } catch (retryError) {
            // If retry also fails, logout user
            if (__DEV__) {
              console.error('[Interceptor] Retry failed, clearing tokens');
            }
            await deleteTokens();
            throw retryError;
          }
        } else {
          // Refresh token is invalid/expired - clear all tokens
          if (__DEV__) {
            console.log('[Interceptor] Refresh failed, clearing tokens');
          }
          await deleteTokens();
        }
      } else {
        // For auth endpoints with 401, just clear tokens (no refresh attempt)
        await deleteTokens();
      }
    }

    // 404 на /auth/user - пользователь не найден (токен невалиден или пользователь удален)
    if (status === 404 && url === ApiRoutes.Auth.User) {
      // User not found - token might be invalid or user deleted
      await deleteTokens();
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
          console.log('[Interceptor] Deleting tokens due to 403');
        }
        await deleteTokens();
        // AuthStore.checkAuth() or соответствующий метод handle logout when error is thrown
      }
      // Для GET /user-profile с 403 не удаляем токен - это означает отсутствие профиля
      // Для эндпоинтов друзей с 403 не удаляем токен - это означает отсутствие прав доступа к данным друга
    }

    throw error;
  }
);

/**
 * Attempt to refresh access token using refresh token
 * Best practice: Implements token rotation (new refresh token is returned)
 */
async function refreshAccessToken(): Promise<string | null> {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing && refreshPromise) {
    if (__DEV__) {
      console.log('[Interceptor] Refresh already in progress, waiting...');
    }
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        if (__DEV__) {
          console.log('[Interceptor] No refresh token available');
        }
        return null;
      }

      if (__DEV__) {
        console.log('[Interceptor] Attempting to refresh access token...');
      }

      // Import authService dynamically to avoid circular dependency
      const { authService } = await import('./services/auth.service');
      
      const response = await authService.refreshToken({
        refreshToken,
        // Optional: can add deviceInfo and ipAddress from client
      });

      if (response.data?.jwtToken && response.data?.refreshToken) {
        // Save new tokens (rotation: old refresh token is invalidated, new one is provided)
        await saveTokens(response.data.jwtToken, response.data.refreshToken);
        
        if (__DEV__) {
          console.log('[Interceptor] Access token refreshed successfully');
        }
        
        return response.data.jwtToken;
      }

      return null;
    } catch (refreshError: any) {
      if (__DEV__) {
        console.error('[Interceptor] Token refresh failed:', refreshError.response?.status || refreshError.message);
      }
      
      // Refresh token is invalid/expired - clear all tokens and logout
      await deleteTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
