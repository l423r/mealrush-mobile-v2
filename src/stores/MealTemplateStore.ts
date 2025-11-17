import { makeAutoObservable, runInAction } from 'mobx';
import { mealTemplateService } from '../api/services/mealTemplate.service';
import { mealTemplateElementService } from '../api/services/mealTemplateElement.service';
import type RootStore from './RootStore';
import type {
  MealTemplate,
  MealTemplateCreate,
  MealTemplateUpdate,
  MealTemplateUseRequest,
  MealTemplateElement,
  MealTemplateElementCreate,
  MealTemplateElementUpdate,
  Meal,
  PaginatedResponse,
} from '../types/api.types';

class MealTemplateStore {
  rootStore: RootStore;

  // State
  templates: MealTemplate[] = [];
  selectedTemplate: MealTemplate | null = null;
  templateElements: MealTemplateElement[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Actions
  async loadTemplates(page: number = 0, size: number = 20) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateService.getAll(page, size);

      runInAction(() => {
        const content = response.data.content || [];
        if (page === 0) {
          this.templates = content;
        } else {
          this.templates = [...this.templates, ...content];
        }
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки шаблонов';
      });
      throw error;
    }
  }

  async createFromMeal(mealId: number) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateService.createFromMeal(mealId);

      runInAction(() => {
        this.templates.unshift(response.data);
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка создания шаблона';
      });
      throw error;
    }
  }

  async createTemplate(templateData: MealTemplateCreate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateService.create(templateData);

      runInAction(() => {
        this.templates.unshift(response.data);
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка создания шаблона';
      });
      throw error;
    }
  }

  async loadTemplate(id: number) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateService.getById(id);

      runInAction(() => {
        this.selectedTemplate = response.data;
        this.templateElements = response.data.elements || [];
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки шаблона';
      });
      throw error;
    }
  }

  async getTemplate(id: number) {
    return this.loadTemplate(id);
  }

  async loadTemplateElements(templateId: number, page: number = 0, size: number = 50) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateElementService.getByTemplate(templateId, page, size);

      runInAction(() => {
        const content = response.data.content || [];
        if (page === 0) {
          this.templateElements = content;
        } else {
          this.templateElements = [...this.templateElements, ...content];
        }
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки элементов шаблона';
      });
      throw error;
    }
  }

  async createElement(templateId: number, elementData: MealTemplateElementCreate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateElementService.create({
        ...elementData,
        templateId,
      });

      runInAction(() => {
        this.templateElements.push(response.data);
        if (this.selectedTemplate) {
          this.selectedTemplate.elements = [...this.selectedTemplate.elements, response.data];
        }
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка создания элемента шаблона';
      });
      throw error;
    }
  }

  async updateElement(elementId: number, elementData: MealTemplateElementUpdate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateElementService.update(elementId, elementData);

      runInAction(() => {
        const index = this.templateElements.findIndex((e) => e.id === elementId);
        if (index !== -1) {
          this.templateElements[index] = response.data;
        }
        if (this.selectedTemplate) {
          const templateIndex = this.selectedTemplate.elements.findIndex((e) => e.id === elementId);
          if (templateIndex !== -1) {
            this.selectedTemplate.elements[templateIndex] = response.data;
          }
        }
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка обновления элемента шаблона';
      });
      throw error;
    }
  }

  async deleteElement(elementId: number) {
    this.loading = true;
    this.error = null;

    try {
      await mealTemplateElementService.delete(elementId);

      runInAction(() => {
        this.templateElements = this.templateElements.filter((e) => e.id !== elementId);
        if (this.selectedTemplate) {
          this.selectedTemplate.elements = this.selectedTemplate.elements.filter(
            (e) => e.id !== elementId
          );
        }
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка удаления элемента шаблона';
      });
      throw error;
    }
  }

  async updateTemplate(id: number, templateData: MealTemplateUpdate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await mealTemplateService.update(id, templateData);

      runInAction(() => {
        const index = this.templates.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.templates[index] = response.data;
        }
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка обновления шаблона';
      });
      throw error;
    }
  }

  async deleteTemplate(id: number) {
    this.loading = true;
    this.error = null;

    try {
      await mealTemplateService.delete(id);

      runInAction(() => {
        this.templates = this.templates.filter((t) => t.id !== id);
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка удаления шаблона';
      });
      throw error;
    }
  }

  async useTemplate(
    id: number,
    dateTime: string,
    mealType?: string,
    name?: string
  ) {
    this.loading = true;
    this.error = null;

    try {
      const request: MealTemplateUseRequest = {
        dateTime,
        mealType: mealType as any,
        name,
      };

      const response = await mealTemplateService.useTemplate(id, request);

      runInAction(() => {
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка использования шаблона';
      });
      throw error;
    }
  }

  reset() {
    this.templates = [];
    this.selectedTemplate = null;
    this.templateElements = [];
    this.loading = false;
    this.error = null;
  }
}

export default MealTemplateStore;

