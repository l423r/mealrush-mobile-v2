import * as yup from 'yup';

// Auth validation schemas
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .required('Пароль обязателен'),
});

export const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .required('Пароль обязателен'),
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .required('Имя обязательно'),
});

// Profile validation schemas
export const userProfileSchema = yup.object().shape({
  height: yup
    .number()
    .min(100, 'Рост должен быть не менее 100 см')
    .max(250, 'Рост должен быть не более 250 см')
    .required('Рост обязателен'),
  weight: yup
    .number()
    .min(30, 'Вес должен быть не менее 30 кг')
    .max(300, 'Вес должен быть не более 300 кг')
    .required('Вес обязателен'),
  gender: yup
    .string()
    .oneOf(['MALE', 'FEMALE'], 'Выберите пол')
    .required('Пол обязателен'),
  birthday: yup
    .string()
    .required('Дата рождения обязательна'),
  target_weight_type: yup
    .string()
    .oneOf(['LOSE', 'SAVE', 'GAIN'], 'Выберите цель')
    .required('Цель обязательна'),
  target_weight: yup
    .number()
    .min(30, 'Целевой вес должен быть не менее 30 кг')
    .max(300, 'Целевой вес должен быть не более 300 кг')
    .when('target_weight_type', {
      is: (val: string) => val !== 'SAVE',
      then: (schema) => schema.required('Целевой вес обязателен'),
    }),
  physical_activity_level: yup
    .string()
    .oneOf(['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH'], 'Выберите уровень активности')
    .required('Уровень активности обязателен'),
  day_limit_cal: yup
    .number()
    .min(800, 'Калорийность должна быть не менее 800 ккал')
    .max(5000, 'Калорийность должна быть не более 5000 ккал')
    .required('Калорийность обязательна'),
});

// Product validation schemas
export const productSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .required('Название обязательно'),
  proteins: yup
    .number()
    .min(0, 'Белки не могут быть отрицательными')
    .max(100, 'Белки не могут быть более 100 г на 100 г')
    .required('Белки обязательны'),
  fats: yup
    .number()
    .min(0, 'Жиры не могут быть отрицательными')
    .max(100, 'Жиры не могут быть более 100 г на 100 г')
    .required('Жиры обязательны'),
  carbohydrates: yup
    .number()
    .min(0, 'Углеводы не могут быть отрицательными')
    .max(100, 'Углеводы не могут быть более 100 г на 100 г')
    .required('Углеводы обязательны'),
  calories: yup
    .number()
    .min(0, 'Калории не могут быть отрицательными')
    .max(1000, 'Калории не могут быть более 1000 ккал на 100 г')
    .required('Калории обязательны'),
  quantity: yup
    .string()
    .required('Количество обязательно'),
});

// Meal element validation schemas
export const mealElementSchema = yup.object().shape({
  quantity: yup
    .string()
    .required('Количество обязательно'),
  proteins: yup
    .number()
    .min(0, 'Белки не могут быть отрицательными')
    .required('Белки обязательны'),
  fats: yup
    .number()
    .min(0, 'Жиры не могут быть отрицательными')
    .required('Жиры обязательны'),
  carbohydrates: yup
    .number()
    .min(0, 'Углеводы не могут быть отрицательными')
    .required('Углеводы обязательны'),
  calories: yup
    .number()
    .min(0, 'Калории не могут быть отрицательными')
    .required('Калории обязательны'),
});

// Helper functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateWeight = (weight: number): boolean => {
  return weight >= 30 && weight <= 300;
};

export const validateHeight = (height: number): boolean => {
  return height >= 100 && height <= 250;
};