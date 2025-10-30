import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  Meal,
  MealCreate,
  MealElement,
  MealElementCreate,
  MealElementUpdate,
  PaginatedResponse,
  PhotoAnalysisRequest,
  PhotoAnalysisResponse,
} from '../../types/api.types';

export const mealService = {
  createMeal: (mealData: MealCreate) =>
    apiClient.post<Meal>(MY_FOOD_ENDPOINTS.MEALS, mealData),

  getMealsByDate: (date: string) =>
    apiClient.get<Meal[]>(MY_FOOD_ENDPOINTS.MEALS_BY_DATE, {
      params: { date },
    }),

  getMeal: (id: number) =>
    apiClient.get<Meal>(`${MY_FOOD_ENDPOINTS.MEALS}/${id}`),

  updateMeal: (id: number, mealData: Meal) =>
    apiClient.put<Meal>(`${MY_FOOD_ENDPOINTS.MEALS}/${id}`, mealData),

  deleteMeal: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.MEALS}/${id}`),

  createMealElement: (elementData: MealElementCreate) =>
    apiClient.post<MealElement>(MY_FOOD_ENDPOINTS.MEAL_ELEMENTS, elementData),

  getMealElements: (mealId: number, page: number = 0, size: number = 50) =>
    apiClient.get<PaginatedResponse<MealElement>>(
      `${MY_FOOD_ENDPOINTS.MEAL_ELEMENTS_BY_MEAL}/${mealId}`,
      {
        params: { page, size },
      }
    ),

  updateMealElement: (id: number, elementData: MealElementUpdate) =>
    apiClient.put<MealElement>(
      `${MY_FOOD_ENDPOINTS.MEAL_ELEMENTS}/${id}`,
      elementData
    ),

  deleteMealElement: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.MEAL_ELEMENTS}/${id}`),

  analyzePhoto: (request: PhotoAnalysisRequest) =>
    apiClient.post<PhotoAnalysisResponse>(
      MY_FOOD_ENDPOINTS.MEAL_ELEMENT_ANALYZE_PHOTO,
      request
    ),
};
