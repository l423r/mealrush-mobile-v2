import { makeAutoObservable, runInAction } from 'mobx';
import { mealService } from '../api/services/meal.service';
import RootStore from './RootStore';
import { Meal, MealCreate, MealElement, MealElementCreate, MealElementUpdate } from '../types/api.types';
import { formatDateForAPI } from '../utils/formatting';

class MealStore {
  rootStore: RootStore;
  
  // State
  meals: Meal[] = [];
  selectedDate: Date = new Date();
  mealElements: { [mealId: number]: MealElement[] } = {};
  loading: boolean = false;
  error: string | null = null;
  analyzingPhoto: boolean = false;
  photoAnalysisError: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Computed
  get mealsForSelectedDate(): Meal[] {
    return this.meals.filter(meal => {
      const mealDate = new Date(meal.dateTime);
      return mealDate.toDateString() === this.selectedDate.toDateString();
    });
  }

  get dailyNutrients(): {
    calories: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
  } {
    const meals = this.mealsForSelectedDate;
    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbohydrates = 0;

    meals.forEach(meal => {
      const elements = this.mealElements[meal.id] || [];
      elements.forEach(element => {
        totalCalories += element.calories;
        totalProteins += element.proteins;
        totalFats += element.fats;
        totalCarbohydrates += element.carbohydrates;
      });
    });

    return {
      calories: Math.round(totalCalories * 100) / 100,
      proteins: Math.round(totalProteins * 100) / 100,
      fats: Math.round(totalFats * 100) / 100,
      carbohydrates: Math.round(totalCarbohydrates * 100) / 100,
    };
  }

  get dailyCalories(): number {
    return this.dailyNutrients.calories;
  }

  get dailyProteins(): number {
    return this.dailyNutrients.proteins;
  }

  get dailyFats(): number {
    return this.dailyNutrients.fats;
  }

  get dailyCarbohydrates(): number {
    return this.dailyNutrients.carbohydrates;
  }

  // Actions
  async loadMealsForDate(date: Date) {
    this.loading = true;
    this.error = null;
    this.selectedDate = date;
    
    try {
      const dateString = formatDateForAPI(date);
      const response = await mealService.getMealsByDate(dateString);
      
      runInAction(() => {
        this.meals = response.data || [];
        this.loading = false;
        this.error = null;
      });
      
      // Load meal elements for each meal
      await Promise.all(
        this.meals.map(meal => this.loadMealElements(meal.id))
      );
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка загрузки приемов пищи';
      });
      throw error;
    }
  }

  async loadMealElements(mealId: number) {
    try {
      const response = await mealService.getMealElements(mealId);
      
      runInAction(() => {
        this.mealElements[mealId] = response.data.content;
      });
      
    } catch (error: any) {
      console.error('Error loading meal elements:', error);
    }
  }

  async createMeal(mealData: MealCreate) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await mealService.createMeal(mealData);
      
      runInAction(() => {
        this.meals.push(response.data);
        this.loading = false;
        this.error = null;
      });
      
      return response.data;
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка создания приема пищи';
      });
      throw error;
    }
  }

  async createMealElement(elementData: MealElementCreate) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await mealService.createMealElement(elementData);
      
      runInAction(() => {
        const mealId = elementData.mealId;
        if (!this.mealElements[mealId]) {
          this.mealElements[mealId] = [];
        }
        this.mealElements[mealId].push(response.data);
        this.loading = false;
        this.error = null;
      });
      
      return response.data;
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка создания элемента приема пищи';
      });
      throw error;
    }
  }

  async updateMealElement(elementId: number, elementData: MealElementUpdate) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await mealService.updateMealElement(elementId, elementData);
      
      runInAction(() => {
        // Find and update the element in mealElements
        Object.keys(this.mealElements).forEach(mealId => {
          const elements = this.mealElements[parseInt(mealId)];
          const index = elements.findIndex(e => e.id === elementId);
          if (index !== -1) {
            elements[index] = response.data;
          }
        });
        this.loading = false;
        this.error = null;
      });
      
      return response.data;
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка обновления элемента приема пищи';
      });
      throw error;
    }
  }

  async deleteMeal(mealId: number) {
    this.loading = true;
    this.error = null;
    
    try {
      await mealService.deleteMeal(mealId);
      
      runInAction(() => {
        this.meals = this.meals.filter(m => m.id !== mealId);
        delete this.mealElements[mealId];
        this.loading = false;
        this.error = null;
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка удаления приема пищи';
      });
      throw error;
    }
  }

  async deleteMealElement(elementId: number) {
    this.loading = true;
    this.error = null;
    
    try {
      await mealService.deleteMealElement(elementId);
      
      runInAction(() => {
        // Find and remove the element from mealElements
        Object.keys(this.mealElements).forEach(mealId => {
          this.mealElements[parseInt(mealId)] = this.mealElements[parseInt(mealId)].filter(
            e => e.id !== elementId
          );
        });
        this.loading = false;
        this.error = null;
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка удаления элемента приема пищи';
      });
      throw error;
    }
  }

  setSelectedDate(date: Date) {
    this.selectedDate = date;
  }

  setError(error: string | null) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  async analyzePhoto(imageBase64: string, language: string = 'ru') {
    this.analyzingPhoto = true;
    this.photoAnalysisError = null;
    
    try {
      const response = await mealService.analyzePhoto({
        imageBase64,
        language,
      });
      
      runInAction(() => {
        this.analyzingPhoto = false;
        this.photoAnalysisError = null;
      });
      
      return response.data;
      
    } catch (error: any) {
      let errorMessage = 'Ошибка анализа фотографии';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = 'Изображение не предоставлено или невалидный формат';
        } else if (status === 408) {
          errorMessage = 'Превышено время ожидания. Попробуйте еще раз';
        } else if (status === 503) {
          errorMessage = 'Сервис анализа недоступен. Попробуйте позже';
        } else {
          errorMessage = error.response?.data?.message || errorMessage;
        }
      }
      
      runInAction(() => {
        this.analyzingPhoto = false;
        this.photoAnalysisError = errorMessage;
      });
      
      throw error;
    }
  }

  reset() {
    this.meals = [];
    this.selectedDate = new Date();
    this.mealElements = {};
    this.loading = false;
    this.error = null;
    this.analyzingPhoto = false;
    this.photoAnalysisError = null;
  }
}

export default MealStore;