import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  WeightEntry,
  WeightEntryCreate,
  WeightStats,
  PaginatedResponse,
} from '../../types/api.types';

export const weightService = {
  // Add weight entry
  addWeight: (data: WeightEntryCreate) =>
    apiClient.post<WeightEntry>(MY_FOOD_ENDPOINTS.WEIGHT_HISTORY, data),

  // Get weight history with pagination
  getHistory: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<WeightEntry>>(
      `${MY_FOOD_ENDPOINTS.WEIGHT_HISTORY}?page=${page}&size=${size}`
    ),

  // Get latest weight entry
  getLatest: () =>
    apiClient.get<WeightEntry>(MY_FOOD_ENDPOINTS.WEIGHT_HISTORY_LATEST),

  // Get weight statistics for a period
  getStats: (days: number = 30) =>
    apiClient.get<WeightStats>(
      `${MY_FOOD_ENDPOINTS.WEIGHT_HISTORY_STATS}?days=${days}`
    ),

  // Delete weight entry
  deleteWeight: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.WEIGHT_HISTORY}/${id}`),
};

