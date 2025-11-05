// Platform import removed as it was unused

// API Base URLs
// Для Android эмулятора используем 10.0.2.2 (перенаправляется на localhost хост-машины)
// Для iOS симулятора можно использовать localhost
// Для физических устройств используйте IP адрес компьютера в локальной сети
const getBaseURL = () => {
  if (__DEV__) {
    // В режиме разработки
    // Для физического устройства используйте IP адрес вашего компьютера в локальной сети
    // Для Android эмулятора используйте: http://10.0.2.2:8080/my-food
    // Для физического Android устройства используйте IP компьютера:
    return 'http://192.168.1.9:8080/my-food';
    // return 'http://10.0.2.2:8080/my-food';
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
  MEAL_ELEMENT_ANALYZE_TEXT: '/meal_element/analyze-text',
  MEAL_ELEMENT_ANALYZE_AUDIO: '/meal_element/analyze-audio',

  // Favorites
  FAVORITES: '/favorite',

  // Devices
  DEVICES: '/device',

  // Nutrition (metrics)
  NUTRITION_DAILY: '/nutrition/daily',
  NUTRITION_WEEKLY: '/nutrition/weekly',
  NUTRITION_MONTHLY: '/nutrition/monthly',
  NUTRITION_TREND: '/nutrition/trend',
  NUTRITION_STATISTICS: '/nutrition/statistics',
  NUTRITION_PROGRESS: '/nutrition/progress',

  // Recommendations
  RECOMMENDATIONS_PRODUCTS: '/recommendations/products',
  RECOMMENDATIONS_INSIGHTS: '/recommendations/insights',
  RECOMMENDATIONS_REFRESH: '/recommendations/refresh',
  RECOMMENDATIONS_MEALS: '/recommendations/meals',

  // Weight History
  WEIGHT_HISTORY: '/weight-history',
  WEIGHT_HISTORY_LATEST: '/weight-history/latest',
  WEIGHT_HISTORY_STATS: '/weight-history/stats',

  // Notifications
  NOTIFICATIONS_REGISTER: '/notifications/register',
  NOTIFICATIONS_DEVICE: '/notifications/device',
  NOTIFICATIONS_PREFERENCES: '/notifications/preferences',
  NOTIFICATIONS_PREFERENCES_RESET: '/notifications/preferences/reset',
} as const;

// Request timeouts
export const REQUEST_TIMEOUT = 30000;
export const PHOTO_ANALYSIS_TIMEOUT = 40000;
export const TEXT_ANALYSIS_TIMEOUT = 40000;
export const AUDIO_ANALYSIS_TIMEOUT = 40000;
