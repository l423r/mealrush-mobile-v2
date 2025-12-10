import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  Meal,
  MealCreate,
  MealElement,
  MealElementCreate,
  MealElementUpdate,
  PaginatedResponse,
  PhotoAnalysisRequest,
  AnalysisResponse,
  TextAnalysisRequest,
  AudioAnalysisRequest,
} from '../../types/api.types';

export const mealService = {
  createMeal: (mealData: MealCreate, targetUserId?: number) =>
    apiClient.post<Meal>(ApiRoutes.Meal.Base, mealData, {
      params: { ...(targetUserId && { targetUserId }) },
    }),

  getMealsByDate: (date: string, targetUserId?: number) =>
    apiClient.get<Meal[]>(ApiRoutes.Meal.FindByDate, {
      params: { date, ...(targetUserId && { targetUserId }) },
    }),

  getMeal: (id: number, targetUserId?: number) =>
    apiClient.get<Meal>(`${ApiRoutes.Meal.Base}/${id}`, {
      params: { ...(targetUserId && { targetUserId }) },
    }),

  updateMeal: (id: number, mealData: Meal) =>
    apiClient.put<Meal>(`${ApiRoutes.Meal.Base}/${id}`, mealData),

  deleteMeal: (id: number) =>
    apiClient.delete(`${ApiRoutes.Meal.Base}/${id}`),

  createMealElement: (elementData: MealElementCreate, targetUserId?: number) =>
    apiClient.post<MealElement>(ApiRoutes.MealElement.Base, elementData, {
      params: { ...(targetUserId && { targetUserId }) },
    }),

  getMealElements: (mealId: number, page: number = 0, size: number = 50, targetUserId?: number) =>
    apiClient.get<PaginatedResponse<MealElement>>(
      `${ApiRoutes.MealElement.ByMeal}/${mealId}`,
      {
        params: { page, size, ...(targetUserId && { targetUserId }) },
      }
    ),

  updateMealElement: (id: number, elementData: MealElementUpdate) =>
    apiClient.put<MealElement>(
      `${ApiRoutes.MealElement.Base}/${id}`,
      elementData
    ),

  deleteMealElement: (id: number) =>
    apiClient.delete(`${ApiRoutes.MealElement.Base}/${id}`),

  analyzePhoto: (request: PhotoAnalysisRequest) =>
    apiClient.post<AnalysisResponse>(
      ApiRoutes.MealElement.AnalyzePhoto,
      request
    ),

  analyzeText: (request: TextAnalysisRequest) =>
    apiClient.post<AnalysisResponse>(
      ApiRoutes.MealElement.AnalyzeText,
      request
    ),

  analyzeAudio: (request: AudioAnalysisRequest) =>
    apiClient.post<AnalysisResponse>(
      ApiRoutes.MealElement.AnalyzeAudio,
      request
    ),
};
