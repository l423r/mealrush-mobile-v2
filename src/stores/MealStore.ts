import { makeAutoObservable, runInAction } from 'mobx';
import { mealService } from '../api/services/meal.service';
import { nutritionService } from '../api/services/nutrition.service';
import type RootStore from './RootStore';
import type {
  Meal,
  MealCreate,
  MealElement,
  MealElementCreate,
  MealElementUpdate,
  AnalysisMode,
} from '../types/api.types';
import { formatDateForAPI } from '../utils/formatting';
import { withAsync } from '../utils/storeUtils';

class MealStore {
  rootStore: RootStore;

  // State
  meals: Meal[] = [];
  selectedDate: Date = new Date();
  mealElements: { [mealId: number]: MealElement[] } = {};
  caloriesByDate: Record<string, number> = {};
  loading: boolean = false;
  error: string | null = null;
  analyzingPhoto: boolean = false;
  photoAnalysisError: string | null = null;
  analyzingText: boolean = false;
  textAnalysisError: string | null = null;
  analyzingAudio: boolean = false;
  audioAnalysisError: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Computed
  get mealsForSelectedDate(): Meal[] {
    return this.meals.filter((meal) => {
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

    meals.forEach((meal) => {
      const elements = this.mealElements[meal.id] || [];
      elements.forEach((element) => {
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

  // Get meals by type for selected date, sorted by dateTime (latest first)
  getMealsByTypeForDate(mealType: string): Meal[] {
    console.log('🔍 [MealStore.getMealsByTypeForDate] Поиск приемов пищи');
    console.log('  - mealType:', mealType);
    console.log('  - selectedDate:', this.selectedDate.toISOString());
    console.log('  - mealsForSelectedDate:', this.mealsForSelectedDate);

    const filtered = this.mealsForSelectedDate.filter((meal) => meal.mealType === mealType);
    console.log('  - filtered by type:', filtered);

    const sorted = filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    console.log('  - sorted (latest first):', sorted);

    return sorted;
  }

  // Actions
  async loadMealsForDate(date: Date) {
    this.selectedDate = date;

    await withAsync(
      this,
      async () => {
        const dateString = formatDateForAPI(date);
        const response = await mealService.getMealsByDate(dateString);

        runInAction(() => {
          this.meals = response.data || [];
        });

        // Load meal elements for each meal
        await Promise.all(
          this.meals.map((meal) => this.loadMealElements(meal.id))
        );
      },
      'Ошибка загрузки приемов пищи'
    );
  }

  async loadCaloriesForRange(startDate: Date, endDate: Date) {
    try {
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);

      const response = await nutritionService.getTrend({
        startDate: startDateStr,
        endDate: endDateStr,
        metric: 'CALORIES',
      });

      runInAction(() => {
        const caloriesMap: Record<string, number> = {};
        response.dailyValues.forEach((point) => {
          caloriesMap[point.date] = Math.round(point.value);
        });
        // Merge with existing data to avoid clearing other dates if we load partial ranges
        this.caloriesByDate = { ...this.caloriesByDate, ...caloriesMap };
      });
    } catch (error) {
      console.error('Error loading calories for range:', error);
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
    return withAsync(
      this,
      async () => {
        const response = await mealService.createMeal(mealData);
        runInAction(() => {
          this.meals.push(response.data);
        });
        return response.data;
      },
      'Ошибка создания приема пищи'
    );
  }

  async updateMeal(mealId: number, mealData: Partial<Meal>) {
    return withAsync(
      this,
      async () => {
        const response = await mealService.updateMeal(mealId, mealData as Meal);
        runInAction(() => {
          const index = this.meals.findIndex((m) => m.id === mealId);
          if (index !== -1) {
            this.meals[index] = response.data;
          }
        });
        return response.data;
      },
      'Ошибка обновления приема пищи'
    );
  }

  async createMealElement(elementData: MealElementCreate) {
    return withAsync(
      this,
      async () => {
        const response = await mealService.createMealElement(elementData);
        runInAction(() => {
          const mealId = elementData.mealId;
          if (!this.mealElements[mealId]) {
            this.mealElements[mealId] = [];
          }
          this.mealElements[mealId].push(response.data);
        });
        return response.data;
      },
      'Ошибка создания элемента приема пищи'
    );
  }

  async updateMealElement(elementId: number, elementData: MealElementUpdate) {
    return withAsync(
      this,
      async () => {
        const response = await mealService.updateMealElement(
          elementId,
          elementData
        );
        runInAction(() => {
          Object.keys(this.mealElements).forEach((mealId) => {
            const elements = this.mealElements[parseInt(mealId)];
            const index = elements.findIndex((e) => e.id === elementId);
            if (index !== -1) {
              elements[index] = response.data;
            }
          });
        });
        return response.data;
      },
      'Ошибка обновления элемента приема пищи'
    );
  }

  async deleteMeal(mealId: number) {
    return withAsync(
      this,
      async () => {
        await mealService.deleteMeal(mealId);
        runInAction(() => {
          this.meals = this.meals.filter((m) => m.id !== mealId);
          delete this.mealElements[mealId];
        });
      },
      'Ошибка удаления приема пищи'
    );
  }

  async deleteMealElement(elementId: number) {
    return withAsync(
      this,
      async () => {
        await mealService.deleteMealElement(elementId);
        runInAction(() => {
          Object.keys(this.mealElements).forEach((mealId) => {
            this.mealElements[parseInt(mealId)] = this.mealElements[
              parseInt(mealId)
            ].filter((e) => e.id !== elementId);
          });
        });
      },
      'Ошибка удаления элемента приема пищи'
    );
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

  async analyzePhoto(
    imageBase64: string,
    language: string = 'ru',
    comment?: string,
    analysisMode?: AnalysisMode
  ) {
    this.analyzingPhoto = true;
    this.photoAnalysisError = null;

    try {
      const response = await mealService.analyzePhoto({
        imageBase64,
        language,
        comment,
        analysisMode,
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

  async analyzeText(description: string, language: string = 'ru', analysisMode?: AnalysisMode) {
    this.analyzingText = true;
    this.textAnalysisError = null;

    try {
      const response = await mealService.analyzeText({
        description,
        language,
        analysisMode,
      });

      runInAction(() => {
        this.analyzingText = false;
        this.textAnalysisError = null;
      });

      return response.data;
    } catch (error: any) {
      let errorMessage = 'Ошибка анализа текста';

      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = 'Описание не предоставлено или невалидный формат';
        } else if (status === 408) {
          errorMessage = 'Превышено время ожидания. Попробуйте еще раз';
        } else if (status === 503) {
          errorMessage = 'Сервис анализа недоступен. Попробуйте позже';
        } else {
          errorMessage = error.response?.data?.message || errorMessage;
        }
      }

      runInAction(() => {
        this.analyzingText = false;
        this.textAnalysisError = errorMessage;
      });

      throw error;
    }
  }

  async analyzeAudio(
    audioBase64: string,
    language: string = 'ru',
    comment?: string,
    analysisMode?: AnalysisMode
  ) {
    this.analyzingAudio = true;
    this.audioAnalysisError = null;

    try {
      const response = await mealService.analyzeAudio({
        audioBase64,
        language,
        comment,
        analysisMode,
      });

      runInAction(() => {
        this.analyzingAudio = false;
        this.audioAnalysisError = null;
      });

      return response.data;
    } catch (error: any) {
      let errorMessage = 'Ошибка анализа аудио';

      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = 'Аудио не предоставлено или невалидный формат';
        } else if (status === 408) {
          errorMessage = 'Превышено время ожидания. Попробуйте еще раз';
        } else if (status === 503) {
          errorMessage = 'Сервис анализа недоступен. Попробуйте позже';
        } else {
          errorMessage = error.response?.data?.message || errorMessage;
        }
      }

      runInAction(() => {
        this.analyzingAudio = false;
        this.audioAnalysisError = errorMessage;
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
    this.analyzingText = false;
    this.textAnalysisError = null;
    this.analyzingAudio = false;
    this.audioAnalysisError = null;
  }
}

export default MealStore;
