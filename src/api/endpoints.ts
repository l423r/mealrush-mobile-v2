import { Platform } from 'react-native';

// API Base URLs
// Для Android эмулятора используем 10.0.2.2 (перенаправляется на localhost хост-машины)
// Для iOS симулятора можно использовать localhost
// Для физических устройств используйте IP адрес компьютера в локальной сети
const getBaseURL = () => {
  if (__DEV__) {
    // В режиме разработки
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/my-food'; // Android эмулятор
    } else {
      return 'http://localhost:8080/my-food'; // iOS симулятор
    }
  } else {
    // В production
    return 'http://80.87.201.75:8079/gateway/my-food';
  }
};

export const API_BASE_URL = getBaseURL();

// Auth endpoints (now under /my-food/auth/*)
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/token',
  REGISTER: '/auth/user',
  USER: '/auth/user',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

// My-food endpoints
export const MY_FOOD_ENDPOINTS = {
  // User Profile
  USER_PROFILE: '/user-profile',
  
  // Products
  PRODUCTS: '/product',
  PRODUCT_SEARCH_NAME: '/product/search/name',
  PRODUCT_SEARCH_BARCODE: '/product/search/barcode',
  PRODUCT_CATEGORIES: '/product_category',
  
  // Meals
  MEALS: '/meal',
  MEALS_BY_DATE: '/meal/findByDate',
  
  // Meal Elements
  MEAL_ELEMENTS: '/meal_element',
  MEAL_ELEMENTS_BY_MEAL: '/meal_element/meal',
  MEAL_ELEMENT_ANALYZE_PHOTO: '/meal_element/analyze-photo',
  
  // Favorites
  FAVORITES: '/favorite',
  
  // Devices
  DEVICES: '/device',
} as const;

// Request timeouts
export const REQUEST_TIMEOUT = 30000;
export const PHOTO_ANALYSIS_TIMEOUT = 40000;