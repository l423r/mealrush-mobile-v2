import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  MealTemplate,
  MealTemplateCreate,
  MealTemplateUpdate,
  MealTemplateUseRequest,
  Meal,
  PaginatedResponse,
} from '../../types/api.types';

export const mealTemplateService = {
  createFromMeal: (mealId: number) =>
    apiClient.post<MealTemplate>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_FROM_MEAL}?mealId=${mealId}`
    ),

  create: (templateData: MealTemplateCreate) =>
    apiClient.post<MealTemplate>(
      MY_FOOD_ENDPOINTS.MEAL_TEMPLATES,
      templateData
    ),

  getAll: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<MealTemplate>>(
      MY_FOOD_ENDPOINTS.MEAL_TEMPLATES,
      {
        params: { page, size },
      }
    ),

  getById: (id: number) =>
    apiClient.get<MealTemplate>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATES}/${id}`
    ),

  update: (id: number, templateData: MealTemplateUpdate) =>
    apiClient.put<MealTemplate>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATES}/${id}`,
      templateData
    ),

  delete: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.MEAL_TEMPLATES}/${id}`),

  useTemplate: (id: number, request: MealTemplateUseRequest) =>
    apiClient.post<Meal>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_USE}/${id}/use`,
      request
    ),
};

