import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
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
      `${ApiRoutes.MealTemplate.FromMeal}?mealId=${mealId}`
    ),

  create: (templateData: MealTemplateCreate) =>
    apiClient.post<MealTemplate>(
      ApiRoutes.MealTemplate.Base,
      templateData
    ),

  getAll: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<MealTemplate>>(
      ApiRoutes.MealTemplate.Base,
      {
        params: { page, size },
      }
    ),

  getById: (id: number) =>
    apiClient.get<MealTemplate>(
      `${ApiRoutes.MealTemplate.Base}/${id}`
    ),

  update: (id: number, templateData: MealTemplateUpdate) =>
    apiClient.put<MealTemplate>(
      `${ApiRoutes.MealTemplate.Base}/${id}`,
      templateData
    ),

  delete: (id: number) =>
    apiClient.delete(`${ApiRoutes.MealTemplate.Base}/${id}`),

  useTemplate: (id: number, request: MealTemplateUseRequest) =>
    apiClient.post<Meal>(
      `${ApiRoutes.MealTemplate.Base}/${id}/use`,
      request
    ),
};

