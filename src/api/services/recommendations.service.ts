import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  InsightResponse,
  PageResponse,
  ProductResponse,
} from '../../types/api.types';

export interface GetRecommendationsProductsParams {
  page?: number;
  size?: number;
}

export interface GetMealPicksParams {
  size?: number;
}

export const recommendationsService = {
  getProducts: async (params: GetRecommendationsProductsParams) => {
    const res = await apiClient.get<PageResponse<ProductResponse>>(
      ApiRoutes.Recommendations.Products,
      { params }
    );
    return res.data;
  },
  getInsights: async () => {
    const res = await apiClient.get<InsightResponse[]>(
      ApiRoutes.Recommendations.Insights
    );
    return res.data;
  },
  refresh: async () => {
    const res = await apiClient.post(
      ApiRoutes.Recommendations.Refresh,
      {}
    );
    return res.status; // 200 OK expected
  },
  getMealPicks: async (params: GetMealPicksParams) => {
    const res = await apiClient.get<ProductResponse[]>(
      ApiRoutes.Recommendations.Meals,
      { params }
    );
    return res.data;
  },
};

export type RecommendationsService = typeof recommendationsService;
