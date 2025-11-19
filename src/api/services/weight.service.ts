import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  WeightEntry,
  WeightEntryCreate,
  WeightStats,
  PaginatedResponse,
} from '../../types/api.types';

export const weightService = {
  // Add weight entry
  addWeight: (data: WeightEntryCreate) =>
    apiClient.post<WeightEntry>(ApiRoutes.WeightHistory.Base, data),

  // Get weight history with pagination
  getHistory: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<WeightEntry>>(
      `${ApiRoutes.WeightHistory.Base}?page=${page}&size=${size}`
    ),

  // Get latest weight entry
  getLatest: () =>
    apiClient.get<WeightEntry>(ApiRoutes.WeightHistory.Latest),

  // Get weight statistics for a period
  getStats: (days: number = 30) =>
    apiClient.get<WeightStats>(
      `${ApiRoutes.WeightHistory.Stats}?days=${days}`
    ),

  // Delete weight entry
  deleteWeight: (id: number) =>
    apiClient.delete(`${ApiRoutes.WeightHistory.Base}/${id}`),
};

