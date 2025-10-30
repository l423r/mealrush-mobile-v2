import { makeAutoObservable, runInAction } from 'mobx';
import type RootStore from './RootStore';
import type {
  NutritionSummaryResponse,
  NutritionTrendResponse,
  StatisticsResponse,
  ProgressResponse,
  NutritionMetricType,
} from '../types/api.types';
import { nutritionService } from '../api/services/nutrition.service';

class NutritionStore {
  rootStore: RootStore;

  daily: NutritionSummaryResponse | null = null;
  weekly: NutritionSummaryResponse | null = null;
  monthly: NutritionSummaryResponse | null = null;
  trend: NutritionTrendResponse | null = null;
  statistics: StatisticsResponse | null = null;
  progress: ProgressResponse | null = null;

  loading: boolean = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async loadDaily(date: string) {
    this.loading = true;
    this.error = null;
    try {
      const data = await nutritionService.getDaily({ date });
      runInAction(() => {
        this.daily = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          e.response?.data?.message || 'Ошибка загрузки дневной сводки';
      });
      throw e;
    }
  }

  async loadWeekly(startDate: string) {
    this.loading = true;
    this.error = null;
    try {
      const data = await nutritionService.getWeekly({ startDate });
      runInAction(() => {
        this.weekly = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          e.response?.data?.message || 'Ошибка загрузки недельной сводки';
      });
      throw e;
    }
  }

  async loadMonthly(month: string) {
    this.loading = true;
    this.error = null;
    try {
      const data = await nutritionService.getMonthly({ month });
      runInAction(() => {
        this.monthly = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          e.response?.data?.message || 'Ошибка загрузки месячной сводки';
      });
      throw e;
    }
  }

  async loadTrend(
    startDate: string,
    endDate: string,
    metric: NutritionMetricType
  ) {
    this.loading = true;
    this.error = null;
    try {
      const data = await nutritionService.getTrend({
        startDate,
        endDate,
        metric,
      });
      runInAction(() => {
        this.trend = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error = e.response?.data?.message || 'Ошибка загрузки тренда';
      });
      throw e;
    }
  }

  async loadStatistics(startDate: string, endDate: string) {
    this.loading = true;
    this.error = null;
    try {
      const data = await nutritionService.getStatistics({ startDate, endDate });
      runInAction(() => {
        this.statistics = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error = e.response?.data?.message || 'Ошибка загрузки статистики';
      });
      throw e;
    }
  }

  async loadProgress(startDate: string, endDate: string) {
    this.loading = true;
    this.error = null;
    try {
      const data = await nutritionService.getProgress({ startDate, endDate });
      runInAction(() => {
        this.progress = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error = e.response?.data?.message || 'Ошибка загрузки прогресса';
      });
      throw e;
    }
  }

  reset() {
    this.daily = null;
    this.weekly = null;
    this.monthly = null;
    this.trend = null;
    this.statistics = null;
    this.progress = null;
    this.loading = false;
    this.error = null;
  }
}

export default NutritionStore;
