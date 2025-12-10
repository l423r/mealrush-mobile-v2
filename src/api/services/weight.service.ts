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
  getHistory: (page: number = 0, size: number = 20, targetUserId?: number) =>
    apiClient.get<PaginatedResponse<WeightEntry>>(
      ApiRoutes.WeightHistory.Base,
      {
        params: {
          page,
          size,
          ...(targetUserId && { targetUserId }),
        },
      }
    ),

  // Get latest weight entry
  getLatest: (targetUserId?: number) =>
    apiClient.get<WeightEntry>(ApiRoutes.WeightHistory.Latest, {
      params: { ...(targetUserId && { targetUserId }) },
    }),

  // Get weight statistics for a period
  getStats: (days: number = 30, targetUserId?: number) =>
    apiClient.get<WeightStats>(ApiRoutes.WeightHistory.Stats, {
      params: {
        days,
        ...(targetUserId && { targetUserId }),
      },
    }),

  // Delete weight entry
  deleteWeight: (id: number) =>
    apiClient.delete(`${ApiRoutes.WeightHistory.Base}/${id}`),
};

