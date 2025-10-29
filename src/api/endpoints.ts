// API Base URLs
export const API_BASE_URL = 'http://80.87.201.75:8079/gateway/my-food';
export const AUTH_BASE_URL = 'http://80.87.201.75:8079/gateway/auth';

// Auth endpoints
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