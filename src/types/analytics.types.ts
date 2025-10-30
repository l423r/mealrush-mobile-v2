// Analytics domain types used by AnalyticsStore and related UI components

export type AnalyticsPeriod =
  | 'day'
  | 'week'
  | 'month'
  | { from: string; to: string };

export type TrendMetric = 'calories' | 'protein' | 'fat' | 'carbs';

export interface SummaryKpi {
  totalCalories: number; // total for period
  averageDailyCalories: number; // average per day in period
  protein: number; // grams total
  fat: number; // grams total
  carbs: number; // grams total
  mealsCount: number; // total meals in period
  daysCount: number; // number of days covered
}

export interface TrendPoint {
  date: string; // ISO date (YYYY-MM-DD)
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
}

export interface MacroShare {
  proteinPct: number; // 0..1
  fatPct: number; // 0..1
  carbsPct: number; // 0..1
}

export interface DistributionByMealTypeItem {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
}

export interface DistributionData {
  macroShare: MacroShare; // for donut chart
  byMealType: DistributionByMealTypeItem[]; // for stacked bars
}

export interface TopProductItem {
  id: string;
  name: string;
  calories: number; // contribution in kcal over the period
  macroTag?: 'protein' | 'fat' | 'carbs' | 'mixed';
}

export interface AnalyticsAggregatePayload {
  summary: SummaryKpi;
  trend: TrendPoint[];
  distribution: DistributionData;
  topProducts: TopProductItem[];
}

// Facade for API layer – to be implemented in analytics.service.ts
export interface AnalyticsServiceFacade {
  getAggregates(period: AnalyticsPeriod): Promise<AnalyticsAggregatePayload>;
}
