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

export const passwordResetRequestSchema = yup.object().shape({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
});

export const passwordResetSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

export const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email('Введите корректный email')
    .test(
      'no-double-dot',
      'Введите корректный email',
      (value) => {
        if (!value) return true; // Пропускаем, если значение пустое (required обработает это)
        const localPart = value.split('@')[0];
        // Проверяем, что в локальной части нет двойной точки
        return !localPart.includes('..');
      }
    )
    .required('Email обязателен'),
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(255, 'Имя не должно превышать 255 символов')
    .required('Имя обязательно'),
});

// Profile validation schemas
export const userProfileSchema = yup.object().shape({
  height: yup
    .number()
    .min(100, 'Рост должен быть не менее 100 см')
    .max(250, 'Рост должен быть не более 250 см')
    .required('Рост обязателен'),
  // Weight is now managed separately through weight history
  weight: yup
    .number()
    .min(30, 'Вес должен быть не менее 30 кг')
    .max(300, 'Вес должен быть не более 300 кг')
    .optional(),
  gender: yup
    .string()
    .oneOf(['MALE', 'FEMALE'], 'Выберите пол')
    .required('Пол обязателен'),
  birthday: yup
    .string()
    .required('Дата рождения обязательна')
    .test(
      'valid-birthday',
      'Дата рождения должна быть в прошлом и не раньше 1900-01-01',
      (value) => {
        if (!value) return true; // required will handle empty
        const birthday = new Date(value);
        const today = new Date();
        const minDate = new Date('1900-01-01');
        return birthday <= today && birthday >= minDate;
      }
    ),
  targetWeightType: yup
    .string()
    .oneOf(['LOSE', 'SAVE', 'GAIN'], 'Выберите цель')
    .required('Цель обязательна'),
  targetWeight: yup
    .number()
    .min(30, 'Целевой вес должен быть не менее 30 кг')
    .max(300, 'Целевой вес должен быть не более 300 кг')
    .when('targetWeightType', {
      is: (val: string) => val !== 'SAVE',
      then: (schema) => schema.required('Целевой вес обязателен'),
    }),
  physicalActivityLevel: yup
    .string()
    .oneOf(
      ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH'],
      'Выберите уровень активности'
    )
    .required('Уровень активности обязателен'),
  dayLimitCal: yup
    .number()
    .min(800, 'Калорийность должна быть не менее 800 ккал')
    .max(5000, 'Калорийность должна быть не более 5000 ккал')
    .optional(), // Optional - backend will calculate automatically if not provided
  timezone: yup
    .string()
    .required('Часовой пояс обязателен')
    .min(1, 'Часовой пояс обязателен'),
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
  quantity: yup.string().required('Количество обязательно'),
  portionQuantity: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? undefined : value
    )
    .typeError('Укажите количество порций')
    .required('Укажите количество порций')
    .min(1, 'Количество порции должно быть не менее 1 г')
    .max(10000, 'Количество порции должно быть не более 10000 г'),
});

// Meal element validation schemas
export const mealElementSchema = yup.object().shape({
  quantity: yup.string().required('Количество обязательно'),
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

// Weight entry validation schema
export const weightEntrySchema = yup.object().shape({
  weight: yup
    .number()
    .min(30, 'Вес должен быть не менее 30 кг')
    .max(300, 'Вес должен быть не более 300 кг')
    .required('Вес обязателен'),
  recordedAt: yup.string().required('Дата и время обязательны'),
  notes: yup.string().max(500, 'Заметки не должны превышать 500 символов'),
});
