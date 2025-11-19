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
  createMeal: (mealData: MealCreate) =>
    apiClient.post<Meal>(ApiRoutes.Meal.Base, mealData),

  getMealsByDate: (date: string) =>
    apiClient.get<Meal[]>(ApiRoutes.Meal.FindByDate, {
      params: { date },
    }),

  getMeal: (id: number) =>
    apiClient.get<Meal>(`${ApiRoutes.Meal.Base}/${id}`),

  updateMeal: (id: number, mealData: Meal) =>
    apiClient.put<Meal>(`${ApiRoutes.Meal.Base}/${id}`, mealData),

  deleteMeal: (id: number) =>
    apiClient.delete(`${ApiRoutes.Meal.Base}/${id}`),

  createMealElement: (elementData: MealElementCreate) =>
    apiClient.post<MealElement>(ApiRoutes.MealElement.Base, elementData),

  getMealElements: (mealId: number, page: number = 0, size: number = 50) =>
    apiClient.get<PaginatedResponse<MealElement>>(
      `${ApiRoutes.MealElement.ByMeal}/${mealId}`,
      {
        params: { page, size },
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
