import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

// Date formatting
export const formatDate = (
  date: string | Date,
  formatString: string = 'dd.MM.yyyy'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString, { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateTimeForAPI = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 1): string => {
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
};

export const formatCalories = (calories: number): string => {
  return `${formatNumber(calories, 0)} ккал`;
};

export const formatWeight = (weight: number): string => {
  return `${formatNumber(weight, 1)} г`;
};

export const formatPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

// Text formatting
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Meal type formatting
export const formatMealType = (mealType: string): string => {
  const mealTypes: Record<string, string> = {
    BREAKFAST: 'Завтрак',
    LUNCH: 'Обед',
    DINNER: 'Ужин',
    SUPPER: 'Полдник',
    LATE_SUPPER: 'Поздний ужин',
  };
  return mealTypes[mealType] || mealType;
};

// Gender formatting
export const formatGender = (gender: string): string => {
  const genders: Record<string, string> = {
    MALE: 'Мужской',
    FEMALE: 'Женский',
  };
  return genders[gender] || gender;
};

// Target weight type formatting
export const formatTargetWeightType = (targetType: string): string => {
  const targetTypes: Record<string, string> = {
    LOSE: 'Сбросить вес',
    SAVE: 'Сохранить вес',
    GAIN: 'Набрать вес',
  };
  return targetTypes[targetType] || targetType;
};

// Activity level formatting
export const formatActivityLevel = (level: string): string => {
  const levels: Record<string, string> = {
    FIRST: 'Минимальная активность',
    SECOND: 'Легкая активность',
    THIRD: 'Умеренная активность',
    FOURTH: 'Высокая активность',
    FIFTH: 'Очень высокая активность',
  };
  return levels[level] || level;
};

// Measurement type formatting
export const formatMeasurementType = (type: string): string => {
  const types: Record<string, string> = {
    GRAM: 'г',
    KILOGRAM: 'кг',
    LITER: 'л',
    MILLILITER: 'мл',
    PIECE: 'шт',
    UNIT: 'ед',
  };
  return types[type] || type;
};

// Error message formatting
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors?.[0]?.message) {
    return error.response.data.errors[0].message;
  }
  return 'Произошла неизвестная ошибка';
};

// Validation error formatting
export const formatValidationErrors = (
  errors: any[]
): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  errors.forEach((error) => {
    if (error.field && error.message) {
      formattedErrors[error.field] = error.message;
    }
  });
  return formattedErrors;
};
