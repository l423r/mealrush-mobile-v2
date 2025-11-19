import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  MealTemplateElement,
  MealTemplateElementCreate,
  MealTemplateElementUpdate,
  PaginatedResponse,
} from '../../types/api.types';

export const mealTemplateElementService = {
  create: (elementData: MealTemplateElementCreate) =>
    apiClient.post<MealTemplateElement>(
      ApiRoutes.MealTemplate.Elements,
      elementData
    ),

  getById: (id: number) =>
    apiClient.get<MealTemplateElement>(
      `${ApiRoutes.MealTemplate.Elements}/${id}`
    ),

  update: (id: number, elementData: MealTemplateElementUpdate) =>
    apiClient.put<MealTemplateElement>(
      `${ApiRoutes.MealTemplate.Elements}/${id}`,
      elementData
    ),

  delete: (id: number) =>
    apiClient.delete(`${ApiRoutes.MealTemplate.Elements}/${id}`),

  getByTemplate: (templateId: number, page: number = 0, size: number = 50) =>
    apiClient.get<PaginatedResponse<MealTemplateElement>>(
      `${ApiRoutes.MealTemplate.ElementsByTemplate}/${templateId}`,
      {
        params: { page, size },
      }
    ),
};

