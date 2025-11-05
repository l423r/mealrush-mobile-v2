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

// Backward-compatible alias matching backend Page shape
export type PageResponse<T> = PaginatedResponse<T>;

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
export type PhysicalActivityLevel =
  | 'FIRST'
  | 'SECOND'
  | 'THIRD'
  | 'FOURTH'
  | 'FIFTH';
export type MeasurementType =
  | 'GRAM'
  | 'KILOGRAM'
  | 'LITER'
  | 'MILLILITER'
  | 'PIECE'
  | 'UNIT';
export type MealType =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SUPPER'
  | 'LATE_SUPPER';

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
  timezone: string;
  bmi?: number;
  recommendedCalories?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileCreate {
  height: number;
  weight: number;
  gender: Gender;
  birthday: string;
  targetWeightType?: TargetWeightType;
  targetWeight?: number;
  physicalActivityLevel?: PhysicalActivityLevel;
  dayLimitCal?: number;
  timezone: string;
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
  timezone?: string;
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

// Analysis types (shared by photo, text, and audio analysis)
export interface AnalysisIngredient {
  name: string;
  quantity: number;
  measurementType: MeasurementType;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
}

export interface AnalysisResponse {
  ingredients: AnalysisIngredient[];
  totalNutrients: {
    proteins: number;
    fats: number;
    carbohydrates: number;
    calories: number;
  };
  confidence: number;
  notes?: string;
}

// Photo Analysis types
export interface PhotoAnalysisRequest {
  imageBase64: string;
  language?: string;
  comment?: string;
}

// Alias for backward compatibility
export type PhotoAnalysisIngredient = AnalysisIngredient;
export type PhotoAnalysisResponse = AnalysisResponse;

// Text Analysis types
export interface TextAnalysisRequest {
  description: string;
  language?: string;
}

// Audio Analysis types
export interface AudioAnalysisRequest {
  audioBase64: string;
  language?: string;
  comment?: string;
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

// =========================
// Nutrition (Metrics) v2.1.0
// =========================

export type NutritionPeriodType = 'DAY' | 'WEEK' | 'MONTH';
export type NutritionMetricType =
  | 'CALORIES'
  | 'PROTEINS'
  | 'FATS'
  | 'CARBOHYDRATES';

export interface NutritionTotals {
  totalProteins: number;
  totalFats: number;
  totalCarbohydrates: number;
  totalCalories: number;
}

export interface NutritionSummaryResponse extends NutritionTotals {
  periodType: NutritionPeriodType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  targetCalories: number;
  caloriesPercentage: number;
}

export interface NutritionTrendPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export type TrendDirection = 'INCREASING' | 'DECREASING' | 'STABLE';

export interface NutritionTrendResponse {
  metricType: NutritionMetricType;
  startDate: string;
  endDate: string;
  dailyValues: NutritionTrendPoint[];
  direction: TrendDirection;
  averageValue: number | null;
  predictedValue: number | null;
}

export interface TopProductStatItem {
  productId: number;
  productName: string;
  usageCount: number;
}

export interface StatisticsResponse {
  startDate: string;
  endDate: string;
  averageCalories: number;
  averageProteins: number;
  averageFats: number;
  averageCarbohydrates: number;
  categoryUsageStats: Record<string, number>;
  topProducts: TopProductStatItem[];
  totalMeals: number;
  totalDays: number;
}

export type GoalStatus = 'ON_TRACK' | 'BEHIND' | 'AHEAD';

export interface DailyProgressItem {
  date: string; // YYYY-MM-DD
  calories: number;
  percentage: number;
}

export interface ProgressResponse {
  startDate: string;
  endDate: string;
  averageDailyCalories: number;
  targetCalories: number;
  caloriesAchievementPercentage: number;
  goalStatus: GoalStatus;
  dailyProgress: DailyProgressItem[];
}

// =========================
// Recommendations v2.1.0
// =========================

export type InsightType =
  | 'EXCESS_CALORIES'
  | 'LOW_PROTEIN'
  | 'LOW_FATS'
  | 'LOW_CARBOHYDRATES'
  | string;
export type InsightSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | string;

export interface InsightResponse {
  id: number;
  insightType: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  createdAt: string;
}

// Lightweight product shape returned by recommendations endpoints
export interface ProductResponse {
  id: number;
  name: string;
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  measurementType: MeasurementType;
  quantity: string;
  productCategoryId?: string;
  imageUrl?: string;
}

export interface RecommendationsProductsParams {
  page?: number;
  size?: number;
}

export interface MealPicksParams {
  size?: number; // default decided by backend
}

// =========================
// Weight History v2.1.0
// =========================

export interface WeightEntry {
  id: number;
  weight: number;
  recordedAt: string;
  notes: string | null;
  createdAt: string;
}

export interface WeightStats {
  currentWeight: number;
  startWeight: number;
  totalChange: number;
  averageWeeklyChange: number;
  periodDays: number;
  recordCount: number;
}

export interface WeightEntryCreate {
  weight: number;
  recordedAt: string;
  notes?: string;
}

// =========================
// Notifications
// =========================

export type DeviceType = 'ANDROID' | 'IOS';

export interface DeviceRegistrationRequest {
  fcmToken: string;
  deviceType: DeviceType;
}

export interface DeviceRegistrationResponse {
  id: number;
  userId: number;
  fcmToken: string;
  deviceType: DeviceType;
  createdAt: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
