import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  NutritionSummaryResponse,
  NutritionTrendResponse,
  StatisticsResponse,
  ProgressResponse,
  NutritionMetricType,
} from '../../types/api.types';

export interface GetDailyParams {
  date: string; // YYYY-MM-DD
}

export interface GetWeeklyParams {
  startDate: string; // YYYY-MM-DD
}

export interface GetMonthlyParams {
  month: string; // YYYY-MM
}

export interface GetTrendParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  metric: NutritionMetricType;
}

export interface GetRangeParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export const nutritionService = {
  getDaily: async (params: GetDailyParams) => {
    const res = await apiClient.get<NutritionSummaryResponse>(
      MY_FOOD_ENDPOINTS.NUTRITION_DAILY,
      { params }
    );
    console.log('API Response - getDaily:', JSON.stringify(res.data, null, 2));
    return res.data;
  },
  getWeekly: async (params: GetWeeklyParams) => {
    const res = await apiClient.get<NutritionSummaryResponse>(
      MY_FOOD_ENDPOINTS.NUTRITION_WEEKLY,
      { params }
    );
    console.log('API Response - getWeekly:', JSON.stringify(res.data, null, 2));
    return res.data;
  },
  getMonthly: async (params: GetMonthlyParams) => {
    const res = await apiClient.get<NutritionSummaryResponse>(
      MY_FOOD_ENDPOINTS.NUTRITION_MONTHLY,
      { params }
    );
    console.log(
      'API Response - getMonthly:',
      JSON.stringify(res.data, null, 2)
    );
    return res.data;
  },
  getTrend: async (params: GetTrendParams) => {
    const res = await apiClient.get<NutritionTrendResponse>(
      MY_FOOD_ENDPOINTS.NUTRITION_TREND,
      { params }
    );
    console.log('API Response - getTrend:', JSON.stringify(res.data, null, 2));
    return res.data;
  },
  getStatistics: async (params: GetRangeParams) => {
    const res = await apiClient.get<StatisticsResponse>(
      MY_FOOD_ENDPOINTS.NUTRITION_STATISTICS,
      { params }
    );
    console.log(
      'API Response - getStatistics:',
      JSON.stringify(res.data, null, 2)
    );
    return res.data;
  },
  getProgress: async (params: GetRangeParams) => {
    const res = await apiClient.get<ProgressResponse>(
      MY_FOOD_ENDPOINTS.NUTRITION_PROGRESS,
      { params }
    );
    console.log(
      'API Response - getProgress:',
      JSON.stringify(res.data, null, 2)
    );
    return res.data;
  },
};

export type NutritionService = typeof nutritionService;
