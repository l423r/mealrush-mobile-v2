import { makeAutoObservable, runInAction, computed } from 'mobx';
import type RootStore from './RootStore';
import type {
  InsightResponse,
  PageResponse,
  ProductResponse,
} from '../types/api.types';
import { recommendationsService } from '../api/services/recommendations.service';

interface LoadingStates {
  products: boolean;
  insights: boolean;
  mealPicks: boolean;
  refreshing: boolean;
}

interface ErrorStates {
  products: string | null;
  insights: string | null;
  mealPicks: string | null;
}

interface CacheMetadata {
  productsLastFetch: number | null;
  insightsLastFetch: number | null;
  mealPicksLastFetch: number | null;
}

class RecommendationsStore {
  rootStore: RootStore;

  // Data
  productsPage: PageResponse<ProductResponse> | null = null;
  allProducts: ProductResponse[] = []; // Для infinite scroll
  insights: InsightResponse[] = [];
  mealPicks: ProductResponse[] = [];

  // Loading states
  loading: LoadingStates = {
    products: false,
    insights: false,
    mealPicks: false,
    refreshing: false,
  };

  // Error states
  errors: ErrorStates = {
    products: null,
    insights: null,
    mealPicks: null,
  };

  // Cache metadata
  private cache: CacheMetadata = {
    productsLastFetch: null,
    insightsLastFetch: null,
    mealPicksLastFetch: null,
  };

  // Cache TTL (5 минут)
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      criticalInsights: computed,
      warningInsights: computed,
      infoInsights: computed,
      hasProducts: computed,
      hasInsights: computed,
      hasMealPicks: computed,
      isAnyLoading: computed,
      hasMoreProducts: computed,
    });
  }

  // Computed properties
  get criticalInsights(): InsightResponse[] {
    return this.insights.filter((i) => i.severity === 'CRITICAL');
  }

  get warningInsights(): InsightResponse[] {
    return this.insights.filter((i) => i.severity === 'WARNING');
  }

  get infoInsights(): InsightResponse[] {
    return this.insights.filter((i) => i.severity === 'INFO');
  }

  get hasProducts(): boolean {
    return this.allProducts.length > 0;
  }

  get hasInsights(): boolean {
    return this.insights.length > 0;
  }

  get hasMealPicks(): boolean {
    return this.mealPicks.length > 0;
  }

  get isAnyLoading(): boolean {
    return Object.values(this.loading).some((state) => state);
  }

  get hasMoreProducts(): boolean {
    if (!this.productsPage) return false;
    return this.productsPage.number < this.productsPage.totalPages - 1;
  }

  // Cache validation
  private isCacheValid(lastFetch: number | null): boolean {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < this.CACHE_TTL;
  }

  // Load products with pagination support
  async loadProducts(page: number = 0, size: number = 10, append: boolean = false) {
    // Проверка кеша только для первой страницы
    if (page === 0 && !append && this.isCacheValid(this.cache.productsLastFetch)) {
      console.log('Using cached products');
      return;
    }

    this.loading.products = true;
    this.errors.products = null;
    
    try {
      const data = await recommendationsService.getProducts({ page, size });
      runInAction(() => {
        this.productsPage = data;
        
        if (append && data.content) {
          // Infinite scroll: добавляем к существующим
          this.allProducts = [...this.allProducts, ...data.content];
        } else {
          // Обычная загрузка: заменяем
          this.allProducts = data.content || [];
        }
        
        this.cache.productsLastFetch = Date.now();
        this.loading.products = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading.products = false;
        this.errors.products =
          e.response?.data?.message || 'Ошибка загрузки рекомендаций продуктов';
      });
      throw e;
    }
  }

  // Load next page (для infinite scroll)
  async loadNextProductsPage(size: number = 10) {
    if (!this.hasMoreProducts || this.loading.products) return;
    
    const nextPage = this.productsPage ? this.productsPage.number + 1 : 0;
    await this.loadProducts(nextPage, size, true);
  }

  async loadInsights(forceRefresh: boolean = false) {
    if (!forceRefresh && this.isCacheValid(this.cache.insightsLastFetch)) {
      console.log('Using cached insights');
      return;
    }

    this.loading.insights = true;
    this.errors.insights = null;
    
    try {
      const data = await recommendationsService.getInsights();
      runInAction(() => {
        this.insights = data;
        this.cache.insightsLastFetch = Date.now();
        this.loading.insights = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading.insights = false;
        this.errors.insights = e.response?.data?.message || 'Ошибка загрузки инсайтов';
      });
      throw e;
    }
  }

  async loadMealPicks(size: number = 5, forceRefresh: boolean = false) {
    if (!forceRefresh && this.isCacheValid(this.cache.mealPicksLastFetch)) {
      console.log('Using cached meal picks');
      return;
    }

    this.loading.mealPicks = true;
    this.errors.mealPicks = null;
    
    try {
      const data = await recommendationsService.getMealPicks({ size });
      runInAction(() => {
        this.mealPicks = data;
        this.cache.mealPicksLastFetch = Date.now();
        this.loading.mealPicks = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading.mealPicks = false;
        this.errors.mealPicks =
          e.response?.data?.message ||
          'Ошибка загрузки подборки для приёма пищи';
      });
      throw e;
    }
  }

  async refreshRecommendations() {
    this.loading.refreshing = true;
    
    try {
      // 1. Очищаем кеш на бэкенде
      await recommendationsService.refresh();
      
      // 2. Инвалидируем локальный кеш
      runInAction(() => {
        this.cache.productsLastFetch = null;
        this.cache.insightsLastFetch = null;
        this.cache.mealPicksLastFetch = null;
      });
      
      // 3. Загружаем свежие данные
      await Promise.allSettled([
        this.loadProducts(0, 10),
        this.loadInsights(true),
        this.loadMealPicks(5, true),
      ]);
      
      runInAction(() => {
        this.loading.refreshing = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.loading.refreshing = false;
      });
      throw e;
    }
  }

  // Загрузка всех данных при первом входе
  async loadAll(productsSize: number = 10, mealPicksSize: number = 5) {
    await Promise.allSettled([
      this.loadProducts(0, productsSize),
      this.loadInsights(),
      this.loadMealPicks(mealPicksSize),
    ]);
  }

  // Очистка конкретной ошибки
  clearError(type: keyof ErrorStates) {
    this.errors[type] = null;
  }

  // Очистка всех ошибок
  clearAllErrors() {
    this.errors.products = null;
    this.errors.insights = null;
    this.errors.mealPicks = null;
  }

  reset() {
    this.productsPage = null;
    this.allProducts = [];
    this.insights = [];
    this.mealPicks = [];
    this.loading = {
      products: false,
      insights: false,
      mealPicks: false,
      refreshing: false,
    };
    this.errors = {
      products: null,
      insights: null,
      mealPicks: null,
    };
    this.cache = {
      productsLastFetch: null,
      insightsLastFetch: null,
      mealPicksLastFetch: null,
    };
  }
}

export default RecommendationsStore;
