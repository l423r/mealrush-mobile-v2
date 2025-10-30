import type {
  PhysicalActivityLevel,
  TargetWeightType,
} from '../types/api.types';

// Calculate calories per gram for each macronutrient
export const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  FAT: 9,
  CARBOHYDRATE: 4,
} as const;

// Calculate calories from macronutrients
export const calculateCalories = (
  proteins: number,
  fats: number,
  carbohydrates: number
): number => {
  return (
    proteins * CALORIES_PER_GRAM.PROTEIN +
    fats * CALORIES_PER_GRAM.FAT +
    carbohydrates * CALORIES_PER_GRAM.CARBOHYDRATE
  );
};

// Calculate BMI (Body Mass Index)
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Get BMI category
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Недостаточный вес';
  if (bmi < 25) return 'Нормальный вес';
  if (bmi < 30) return 'Избыточный вес';
  return 'Ожирение';
};

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: 'MALE' | 'FEMALE'
): number => {
  if (gender === 'MALE') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Get activity multiplier
export const getActivityMultiplier = (level: PhysicalActivityLevel): number => {
  const multipliers = {
    FIRST: 1.2, // Минимальная активность
    SECOND: 1.375, // Легкая активность
    THIRD: 1.55, // Умеренная активность
    FOURTH: 1.725, // Высокая активность
    FIFTH: 1.9, // Очень высокая активность
  };
  return multipliers[level];
};

// Get target weight multiplier
export const getTargetWeightMultiplier = (
  targetType: TargetWeightType
): number => {
  const multipliers = {
    LOSE: 0.8, // Дефицит калорий
    SAVE: 1.0, // Поддержание веса
    GAIN: 1.2, // Профицит калорий
  };
  return multipliers[targetType];
};

// Calculate recommended daily calories
export const calculateRecommendedCalories = (
  weight: number,
  height: number,
  age: number,
  gender: 'MALE' | 'FEMALE',
  activityLevel: PhysicalActivityLevel,
  targetType: TargetWeightType
): number => {
  const bmr = calculateBMR(weight, height, age, gender);
  const activityMultiplier = getActivityMultiplier(activityLevel);
  const targetMultiplier = getTargetWeightMultiplier(targetType);

  return Math.round(bmr * activityMultiplier * targetMultiplier);
};

// Recalculate nutrients for different quantity
export const recalculateNutrients = (
  baseProteins: number,
  baseFats: number,
  baseCarbohydrates: number,
  baseCalories: number,
  baseQuantity: number,
  newQuantity: number
) => {
  const multiplier = newQuantity / baseQuantity;

  return {
    proteins: Math.round(baseProteins * multiplier * 100) / 100,
    fats: Math.round(baseFats * multiplier * 100) / 100,
    carbohydrates: Math.round(baseCarbohydrates * multiplier * 100) / 100,
    calories: Math.round(baseCalories * multiplier * 100) / 100,
  };
};

// Calculate daily progress percentage
export const calculateProgressPercentage = (
  current: number,
  target: number
): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Calculate age from birthday
export const calculateAge = (birthday: string): number => {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Format numbers for display
export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};

// Format percentage
export const formatPercentage = (num: number): string => {
  return `${Math.round(num)}%`;
};
