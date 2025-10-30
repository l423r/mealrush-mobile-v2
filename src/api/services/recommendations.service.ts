import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import { InsightResponse, PageResponse, ProductResponse } from '../../types/api.types';

export interface GetRecommendationsProductsParams {
  page?: number;
  size?: number;
}

export interface GetMealPicksParams {
  size?: number;
}

export const recommendationsService = {
  getProducts: async (params: GetRecommendationsProductsParams) => {
    const res = await apiClient.get<PageResponse<ProductResponse>>(MY_FOOD_ENDPOINTS.RECOMMENDATIONS_PRODUCTS, { params });
    return res.data;
  },
  getInsights: async () => {
    const res = await apiClient.get<InsightResponse[]>(MY_FOOD_ENDPOINTS.RECOMMENDATIONS_INSIGHTS);
    return res.data;
  },
  refresh: async () => {
    const res = await apiClient.post(MY_FOOD_ENDPOINTS.RECOMMENDATIONS_REFRESH, {});
    return res.status; // 200 OK expected
  },
  getMealPicks: async (params: GetMealPicksParams) => {
    const res = await apiClient.get<ProductResponse[]>(MY_FOOD_ENDPOINTS.RECOMMENDATIONS_MEALS, { params });
    return res.data;
  },
};

export type RecommendationsService = typeof recommendationsService;

