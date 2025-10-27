// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Array<{
    field: string;
    rejectedValue: any;
    message: string;
  }>;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
  createdAt?: string;
}

// User Profile types
export type Gender = 'MALE' | 'FEMALE';
export type TargetWeightType = 'LOSE' | 'SAVE' | 'GAIN';
export type PhysicalActivityLevel = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH';
export type MeasurementType = 'GRAM' | 'KILOGRAM' | 'LITER' | 'MILLILITER' | 'PIECE' | 'UNIT';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SUPPER' | 'LATE_SUPPER';

export interface UserProfile {
  id: number;
  userId: number;
  height: number;
  weight: number;
  gender: Gender;
  birthday: string;
  targetWeightType: TargetWeightType;
  targetWeight: number;
  physicalActivityLevel: PhysicalActivityLevel;
  dayLimitCal: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileCreate {
  height: number;
  weight: number;
  gender: Gender;
  birthday: string;
  targetWeightType: TargetWeightType;
  targetWeight: number;
  physicalActivityLevel: PhysicalActivityLevel;
  dayLimitCal: number;
}

export interface UserProfileUpdate {
  height?: number;
  weight?: number;
  gender?: Gender;
  birthday?: string;
  targetWeightType?: TargetWeightType;
  targetWeight?: number;
  physicalActivityLevel?: PhysicalActivityLevel;
  dayLimitCal?: number;
}

// Product types
export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: number;
  userId: number | null;
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurementType: MeasurementType;
  productCategoryId?: string;
  code?: string;
  imageUrl?: string;
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductCreate {
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurementType: MeasurementType;
  productCategoryId?: string;
  code?: string;
  imageBase64?: string;
}

export interface ProductUpdate {
  name?: string;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  calories?: number;
  quantity?: string;
  measurementType?: MeasurementType;
  productCategoryId?: string;
  code?: string;
  imageBase64?: string;
}

// Meal types
export interface Meal {
  id: number;
  userId: number;
  mealType: MealType;
  name?: string;
  dateTime: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MealCreate {
  mealType: MealType;
  dateTime: string;
  name?: string;
}

export interface MealUpdate {
  mealType?: MealType;
  dateTime?: string;
  name?: string;
}

// Meal Element types
export interface MealElement {
  id: number;
  mealId: number;
  parentProductId: number | null;
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurementType: MeasurementType;
  defaultProteins: number;
  defaultFats: number;
  defaultCarbohydrates: number;
  defaultCalories: number;
  defaultQuantity: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MealElementCreate {
  mealId: number;
  parentProductId?: number;
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurementType: MeasurementType;
  defaultProteins: number;
  defaultFats: number;
  defaultCarbohydrates: number;
  defaultCalories: number;
  defaultQuantity: string;
  imageBase64?: string;
}

export interface MealElementUpdate {
  quantity?: string;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  calories?: number;
}

// Photo Analysis types
export interface PhotoAnalysisRequest {
  imageBase64: string;
  language?: string;
}

export interface PhotoAnalysisIngredient {
  name: string;
  quantity: number;
  measurementType: MeasurementType;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
}

export interface PhotoAnalysisResponse {
  ingredients: PhotoAnalysisIngredient[];
  totalNutrients: {
    proteins: number;
    fats: number;
    carbohydrates: number;
    calories: number;
  };
  confidence: number;
  notes?: string;
}

// Device types
export type DeviceType = 'ANDROID' | 'IOS';

export interface Device {
  id: number;
  userId: number;
  deviceToken: string;
  deviceType: DeviceType;
  createdAt: string;
}

export interface DeviceCreate {
  deviceToken: string;
  deviceType: DeviceType;
}

// Search types
export interface ProductSearchParams {
  name?: string;
  barcode?: string;
  page?: number;
  size?: number;
}

export interface MealSearchParams {
  date: string;
  page?: number;
  size?: number;
}