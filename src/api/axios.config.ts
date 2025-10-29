import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from './endpoints';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
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
      console.log(`🌐 [REQUEST] ${config.method?.toUpperCase()} ${API_BASE_URL}${config.url}`);
      if (config.params) {
        console.log('Query params:', config.params);
      }
      if (config.data) {
        console.log('Request body:', config.data);
      }
    }
    
    // Skip adding token only for public auth endpoints (POST requests to login, register, reset password)
    const isPublicAuthEndpoint = config.method === 'post' && (
      config.url === '/auth/user' || 
      config.url === '/auth/token' || 
      config.url === '/auth/reset-password'
    );
    
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
      console.log(`✅ [RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    // Log error details in development
    if (__DEV__) {
      console.error(`❌ [ERROR] ${error.response?.status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      if (error.response?.data) {
        console.error('Error response:', error.response.data);
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      await deleteToken();
      // You can dispatch a logout action here or use navigation
      // navigation.navigate('Auth', { screen: 'SignIn' });
    }
    throw error;
  }
);