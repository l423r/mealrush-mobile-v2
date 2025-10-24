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
        console.log('Adding token to request:', config.url);
      } else {
        console.log('No token available for request:', config.url);
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
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      await deleteToken();
      // You can dispatch a logout action here or use navigation
      // navigation.navigate('Auth', { screen: 'SignIn' });
    }
    throw error;
  }
);