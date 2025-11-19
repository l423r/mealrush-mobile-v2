import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
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
      ApiRoutes.Nutrition.Daily,
      { params }
    );
    console.log('API Response - getDaily:', JSON.stringify(res.data, null, 2));
    return res.data;
  },
  getWeekly: async (params: GetWeeklyParams) => {
    const res = await apiClient.get<NutritionSummaryResponse>(
      ApiRoutes.Nutrition.Weekly,
      { params }
    );
    console.log('API Response - getWeekly:', JSON.stringify(res.data, null, 2));
    return res.data;
  },
  getMonthly: async (params: GetMonthlyParams) => {
    const res = await apiClient.get<NutritionSummaryResponse>(
      ApiRoutes.Nutrition.Monthly,
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
      ApiRoutes.Nutrition.Trend,
      { params }
    );
    console.log('API Response - getTrend:', JSON.stringify(res.data, null, 2));
    return res.data;
  },
  getStatistics: async (params: GetRangeParams) => {
    const res = await apiClient.get<StatisticsResponse>(
      ApiRoutes.Nutrition.Statistics,
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
      ApiRoutes.Nutrition.Progress,
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
