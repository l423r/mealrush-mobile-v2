import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  MealTemplateElement,
  MealTemplateElementCreate,
  MealTemplateElementUpdate,
  PaginatedResponse,
} from '../../types/api.types';

export const mealTemplateElementService = {
  create: (elementData: MealTemplateElementCreate) =>
    apiClient.post<MealTemplateElement>(
      MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_ELEMENTS,
      elementData
    ),

  getById: (id: number) =>
    apiClient.get<MealTemplateElement>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_ELEMENTS}/${id}`
    ),

  update: (id: number, elementData: MealTemplateElementUpdate) =>
    apiClient.put<MealTemplateElement>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_ELEMENTS}/${id}`,
      elementData
    ),

  delete: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_ELEMENTS}/${id}`),

  getByTemplate: (templateId: number, page: number = 0, size: number = 50) =>
    apiClient.get<PaginatedResponse<MealTemplateElement>>(
      `${MY_FOOD_ENDPOINTS.MEAL_TEMPLATE_ELEMENTS_BY_TEMPLATE}/${templateId}`,
      {
        params: { page, size },
      }
    ),
};

