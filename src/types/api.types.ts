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
  jwt_token: string;
  token_type: string;
  expires_in: number;
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
  created_at?: string;
}

// User Profile types
export type Gender = 'MALE' | 'FEMALE';
export type TargetWeightType = 'LOSE' | 'SAVE' | 'GAIN';
export type PhysicalActivityLevel = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH';
export type MeasurementType = 'GRAM' | 'KILOGRAM' | 'LITER' | 'MILLILITER' | 'PIECE' | 'UNIT';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SUPPER' | 'LATE_SUPPER';

export interface UserProfile {
  id: number;
  user_id: number;
  height: number;
  weight: number;
  gender: Gender;
  birthday: string;
  target_weight_type: TargetWeightType;
  target_weight: number;
  physical_activity_level: PhysicalActivityLevel;
  day_limit_cal: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfileCreate {
  height: number;
  weight: number;
  gender: Gender;
  birthday: string;
  target_weight_type: TargetWeightType;
  target_weight: number;
  physical_activity_level: PhysicalActivityLevel;
  day_limit_cal: number;
}

export interface UserProfileUpdate {
  height?: number;
  weight?: number;
  gender?: Gender;
  birthday?: string;
  target_weight_type?: TargetWeightType;
  target_weight?: number;
  physical_activity_level?: PhysicalActivityLevel;
  day_limit_cal?: number;
}

// Product types
export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: number;
  user_id: number | null;
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurement_type: MeasurementType;
  code?: string;
  image_url?: string;
  source?: string;
  product_category?: ProductCategory;
  store?: string;
  price?: number;
  created_at: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurement_type: MeasurementType;
  code?: string;
  image_base64?: string;
  product_category?: {
    id: string;
  };
}

export interface ProductUpdate {
  id: number;
  name?: string;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  calories?: number;
  quantity?: string;
  measurement_type?: MeasurementType;
  code?: string;
  image_base64?: string;
  product_category?: {
    id: string;
  };
}

// Meal types
export interface Meal {
  id: number;
  user_id: number;
  meal_type: MealType;
  name?: string;
  date_time: string;
  created_at: string;
  updated_at?: string;
}

export interface MealCreate {
  meal_type: MealType;
  date_time: string;
  name?: string;
}

export interface MealUpdate {
  id: number;
  meal_type?: MealType;
  date_time?: string;
  name?: string;
}

// Meal Element types
export interface MealElement {
  id: number;
  meal_id: number;
  parent_product?: {
    id: number;
    name: string;
  };
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurement_type: MeasurementType;
  default_proteins: number;
  default_fats: number;
  default_carbohydrates: number;
  default_calories: number;
  default_quantity: string;
  code?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface MealElementCreate {
  meal: {
    id: number;
  };
  parent_product?: {
    id: number;
  };
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  quantity: string;
  measurement_type: MeasurementType;
  default_proteins: number;
  default_fats: number;
  default_carbohydrates: number;
  default_calories: number;
  default_quantity: string;
  code?: string;
  image_base64?: string;
}

export interface MealElementUpdate {
  id: number;
  quantity?: string;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  calories?: number;
}

// Photo Analysis types
export interface PhotoAnalysisRequest {
  image_base64: string;
  language?: string;
}

export interface PhotoAnalysisIngredient {
  name: string;
  quantity: number;
  measurement_type: MeasurementType;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
}

export interface PhotoAnalysisResponse {
  ingredients: PhotoAnalysisIngredient[];
  total_nutrients: {
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
  user_id: number;
  device_token: string;
  device_type: DeviceType;
  created_at: string;
}

export interface DeviceCreate {
  device_token: string;
  device_type: DeviceType;
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