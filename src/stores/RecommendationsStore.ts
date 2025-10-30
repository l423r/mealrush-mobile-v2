import { makeAutoObservable, runInAction } from 'mobx';
import type RootStore from './RootStore';
import type {
  InsightResponse,
  PageResponse,
  ProductResponse,
} from '../types/api.types';
import { recommendationsService } from '../api/services/recommendations.service';

class RecommendationsStore {
  rootStore: RootStore;

  productsPage: PageResponse<ProductResponse> | null = null;
  insights: InsightResponse[] = [];
  mealPicks: ProductResponse[] = [];

  loading: boolean = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async loadProducts(page: number = 0, size: number = 10) {
    this.loading = true;
    this.error = null;
    try {
      const data = await recommendationsService.getProducts({ page, size });
      runInAction(() => {
        this.productsPage = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          e.response?.data?.message || 'Ошибка загрузки рекомендаций продуктов';
      });
      throw e;
    }
  }

  async loadInsights() {
    this.loading = true;
    this.error = null;
    try {
      const data = await recommendationsService.getInsights();
      runInAction(() => {
        this.insights = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error = e.response?.data?.message || 'Ошибка загрузки инсайтов';
      });
      throw e;
    }
  }

  async loadMealPicks(size: number = 5) {
    this.loading = true;
    this.error = null;
    try {
      const data = await recommendationsService.getMealPicks({ size });
      runInAction(() => {
        this.mealPicks = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          e.response?.data?.message ||
          'Ошибка загрузки подборки для приёма пищи';
      });
      throw e;
    }
  }

  async refreshAll(
    size: number = 5,
    page: number = 0,
    productsSize: number = 10
  ) {
    try {
      await recommendationsService.refresh();
      await Promise.all([
        this.loadProducts(page, productsSize),
        this.loadInsights(),
        this.loadMealPicks(size),
      ]);
    } catch {
      // error already set in specific loaders
      return;
    }
  }

  reset() {
    this.productsPage = null;
    this.insights = [];
    this.mealPicks = [];
    this.loading = false;
    this.error = null;
  }
}

export default RecommendationsStore;
