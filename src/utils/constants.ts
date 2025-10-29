// App constants
export const APP_NAME = 'MealRush';
export const APP_VERSION = '2.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Search
export const SEARCH_DEBOUNCE_DELAY = 300;
export const MIN_SEARCH_LENGTH = 2;

// Timeouts
export const REQUEST_TIMEOUT = 30000;
export const PHOTO_ANALYSIS_TIMEOUT = 40000;

// Validation limits
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 2;
export const MIN_WEIGHT = 30;
export const MAX_WEIGHT = 300;
export const MIN_HEIGHT = 100;
export const MAX_HEIGHT = 250;
export const MIN_CALORIES = 800;
export const MAX_CALORIES = 5000;

// UI constants
export const HEADER_HEIGHT = 60;
export const TAB_BAR_HEIGHT = 60;
export const BORDER_RADIUS = 8;
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/token',
    REGISTER: '/auth/user',
    USER: '/auth/user',
    RESET_PASSWORD: '/auth/reset-password',
  },
  MY_FOOD: {
    USER_PROFILE: '/user-profile',
    PRODUCTS: '/product',
    PRODUCT_SEARCH_NAME: '/product/search/name',
    PRODUCT_SEARCH_BARCODE: '/product/search/barcode',
    PRODUCT_CATEGORIES: '/product_category',
    MEALS: '/meal',
    MEALS_BY_DATE: '/meal/findByDate',
    MEAL_ELEMENTS: '/meal_element',
    MEAL_ELEMENTS_BY_MEAL: '/meal_element/meal',
    MEAL_ELEMENT_ANALYZE_PHOTO: '/meal_element/analyze-photo',
    FAVORITES: '/favorite',
    DEVICES: '/device',
  },
} as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  { id: 'dairy', name: 'Молочные продукты' },
  { id: 'meat', name: 'Мясо и птица' },
  { id: 'fish', name: 'Рыба и морепродукты' },
  { id: 'vegetables', name: 'Овощи' },
  { id: 'fruits', name: 'Фрукты' },
  { id: 'cereals', name: 'Крупы и злаки' },
  { id: 'bakery', name: 'Хлебобулочные изделия' },
  { id: 'sweets', name: 'Сладости' },
  { id: 'drinks', name: 'Напитки' },
  { id: 'other', name: 'Остальное' },
] as const;

// Meal types
export const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Завтрак' },
  { value: 'LUNCH', label: 'Обед' },
  { value: 'DINNER', label: 'Ужин' },
  { value: 'SUPPER', label: 'Полдник' },
  { value: 'LATE_SUPPER', label: 'Поздний ужин' },
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Мужской' },
  { value: 'FEMALE', label: 'Женский' },
] as const;

// Target weight types
export const TARGET_WEIGHT_TYPES = [
  { value: 'LOSE', label: 'Сбросить вес' },
  { value: 'SAVE', label: 'Сохранить вес' },
  { value: 'GAIN', label: 'Набрать вес' },
] as const;

// Physical activity levels
export const ACTIVITY_LEVELS = [
  { value: 'FIRST', label: 'Минимальная активность', description: 'Сидячий образ жизни' },
  { value: 'SECOND', label: 'Легкая активность', description: 'Легкие упражнения 1-3 дня в неделю' },
  { value: 'THIRD', label: 'Умеренная активность', description: 'Умеренные упражнения 3-5 дней в неделю' },
  { value: 'FOURTH', label: 'Высокая активность', description: 'Интенсивные упражнения 6-7 дней в неделю' },
  { value: 'FIFTH', label: 'Очень высокая активность', description: 'Очень интенсивные упражнения, физическая работа' },
] as const;

// Measurement types
export const MEASUREMENT_TYPES = [
  { value: 'GRAM', label: 'г' },
  { value: 'KILOGRAM', label: 'кг' },
  { value: 'LITER', label: 'л' },
  { value: 'MILLILITER', label: 'мл' },
  { value: 'PIECE', label: 'шт' },
  { value: 'UNIT', label: 'ед' },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Проверьте подключение к интернету',
  SERVER_ERROR: 'Произошла ошибка на сервере. Попробуйте позже',
  UNAUTHORIZED: 'Сессия истекла. Войдите в систему заново',
  FORBIDDEN: 'У вас нет прав для выполнения этой операции',
  NOT_FOUND: 'Ресурс не найден',
  VALIDATION_ERROR: 'Проверьте правильность введенных данных',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Вы успешно вошли в систему',
  REGISTER_SUCCESS: 'Регистрация прошла успешно',
  PROFILE_UPDATED: 'Профиль обновлен',
  PRODUCT_ADDED: 'Продукт добавлен',
  MEAL_ADDED: 'Прием пищи добавлен',
  FAVORITE_ADDED: 'Добавлено в избранное',
  FAVORITE_REMOVED: 'Удалено из избранного',
} as const;