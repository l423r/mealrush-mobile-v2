import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService } from '../api/services/product.service';
import type RootStore from './RootStore';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductCategory,
} from '../types/api.types';

class ProductStore {
  rootStore: RootStore;

  // State - separate products for different tabs
  products: Product[] = []; // Search results (tab 3)
  myProducts: Product[] = []; // User's products (tab 1)
  categories: ProductCategory[] = [];
  favorites: Product[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  loadingMore: boolean = false; // For infinite scroll loading
  error: string | null = null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasMore: boolean;
  } = {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasMore: false,
    };

  searchHistory: string[] = []; // History of search queries

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    makePersistable(this, {
      name: 'ProductStore',
      properties: ['searchHistory'],
      storage: AsyncStorage,
    });
  }

  // Actions
  async searchProducts(query: string, page: number = 0) {
    console.log(
      `🔍 [ProductStore] searchProducts() called - Query: "${query}", Page: ${page}`
    );
    if (!query.trim()) {
      this.products = [];
      return;
    }

    // Set loading state based on page
    if (page === 0) {
      this.loading = true; // Initial load
      this.loadingMore = false;
    } else {
      this.loadingMore = true; // Loading next page
    }
    this.error = null;
    this.searchQuery = query;

    try {
      const response = await productService.searchByName(
        query,
        page,
        this.pagination.size
      );
      console.log(
        `✅ [ProductStore] searchProducts() success - Found ${response.data.content.length} products`
      );

      // Add to history on successful search (only for first page to avoid duplicates on scroll)
      if (page === 0) {
        this.addToHistory(query);
      }

      runInAction(() => {
        if (page === 0) {
          this.products = response.data.content;
        } else {
          this.products = [...this.products, ...response.data.content];
        }

        this.pagination = {
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
          hasMore: !response.data.last,
        };

        // Reset loading state based on page
        if (page === 0) {
          this.loading = false;
        } else {
          this.loadingMore = false;
        }
        this.error = null;
      });
    } catch (error: any) {
      console.error(`❌ [ProductStore] searchProducts() error:`, error);
      runInAction(() => {
        if (page === 0) {
          this.loading = false;
        } else {
          this.loadingMore = false;
        }
        this.error = error.response?.data?.message || 'Ошибка поиска продуктов';
      });
      throw error;
    }
  }

  async getAll(page: number = 0, query?: string) {
    console.log(`🔵 [ProductStore] getAll() called - Loading user products, query: "${query}"`);
    this.loading = true;
    this.error = null;

    try {
      const response = await productService.getAll(page, this.pagination.size, query);
      console.log(
        `✅ [ProductStore] getAll() success - Loaded ${response.data.content.length} products`
      );

      runInAction(() => {
        if (page === 0) {
          this.myProducts = response.data.content;
        } else {
          this.myProducts = [...this.myProducts, ...response.data.content];
        }

        this.pagination = {
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
          hasMore: !response.data.last,
        };

        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      console.error('❌ [ProductStore] getAll() error:', error);
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки продуктов';
      });
      throw error;
    }
  }

  async searchByBarcode(barcode: string) {
    this.loading = true;
    this.error = null;

    try {
      const response = await productService.searchByBarcode(barcode);

      runInAction(() => {
        this.products = response.data.content;
        this.loading = false;
        this.error = null;
      });

      return response.data.content;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Продукт не найден';
      });
      throw error;
    }
  }

  async createProduct(productData: ProductCreate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await productService.createProduct(productData);

      runInAction(() => {
        this.myProducts = [response.data, ...this.myProducts];
        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка создания продукта';
      });
      throw error;
    }
  }

  async updateProduct(id: number, productData: ProductUpdate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await productService.updateProduct(id, productData);

      runInAction(() => {
        // Update in myProducts (user's products)
        const myIndex = this.myProducts.findIndex((p) => p.id === id);
        if (myIndex !== -1) {
          this.myProducts[myIndex] = response.data;
        }

        // Also update in products (in case it's there from search)
        const prodIndex = this.products.findIndex((p) => p.id === id);
        if (prodIndex !== -1) {
          this.products[prodIndex] = response.data;
        }

        this.loading = false;
        this.error = null;
      });

      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка обновления продукта';
      });
      throw error;
    }
  }

  async deleteProduct(productId: number) {
    this.loading = true;
    this.error = null;

    try {
      await productService.deleteProduct(productId);

      runInAction(() => {
        // Remove from myProducts (user's products)
        this.myProducts = this.myProducts.filter((p) => p.id !== productId);
        // Remove from products (search results)
        this.products = this.products.filter((p) => p.id !== productId);
        // Remove from favorites
        this.favorites = this.favorites.filter((p) => p.id !== productId);
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка удаления продукта';
      });
      throw error;
    }
  }

  async getCategories() {
    this.loading = true;
    this.error = null;

    try {
      const response = await productService.getCategories();

      runInAction(() => {
        this.categories = response.data.content;
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки категорий';
      });
      throw error;
    }
  }

  async getFavorites(page: number = 0, query?: string) {
    console.log(`⭐ [ProductStore] getFavorites() called - Loading favorites, query: "${query}"`);
    this.loading = true;
    this.error = null;

    try {
      const response = await productService.getFavorites(page, this.pagination.size, query);
      console.log(
        `✅ [ProductStore] getFavorites() success - Loaded ${response.data.content.length} favorites`
      );

      runInAction(() => {
        this.favorites = response.data.content;
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      console.error('❌ [ProductStore] getFavorites() error:', error);
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки избранного';
      });
      throw error;
    }
  }

  async addToFavorites(productId: number) {
    try {
      await productService.addToFavorites(productId);

      runInAction(() => {
        // Try to find product in myProducts or products (search results)
        const product =
          this.myProducts.find((p) => p.id === productId) ||
          this.products.find((p) => p.id === productId);
        if (product && !this.favorites.find((f) => f.id === productId)) {
          this.favorites.push(product);
        }
      });
    } catch (error: any) {
      runInAction(() => {
        this.error =
          error.response?.data?.message || 'Ошибка добавления в избранное';
      });
      throw error;
    }
  }

  async removeFromFavorites(productId: number) {
    try {
      await productService.removeFromFavorites(productId);

      runInAction(() => {
        this.favorites = this.favorites.filter((f) => f.id !== productId);
      });
    } catch (error: any) {
      runInAction(() => {
        this.error =
          error.response?.data?.message || 'Ошибка удаления из избранного';
      });
      throw error;
    }
  }

  clearSearch() {
    this.products = [];
    this.searchQuery = '';
    this.loading = false;
    this.loadingMore = false;
    this.pagination = {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasMore: false,
    };
  }

  setError(error: string | null) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  reset() {
    this.products = [];
    this.myProducts = [];
    this.categories = [];
    this.favorites = [];
    this.searchQuery = '';
    this.loading = false;
    this.loadingMore = false;
    this.error = null;
    this.pagination = {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasMore: false,
    };
  }
  addToHistory(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return;

    const lastQuery = this.searchHistory[0];

    // Smart History Logic
    if (lastQuery) {
      const lowerQuery = trimmedQuery.toLowerCase();
      const lowerLast = lastQuery.toLowerCase();

      // 1. If typing forward (e.g. "App" -> "Apple"), replace the last entry
      if (lowerQuery.startsWith(lowerLast)) {
        this.searchHistory[0] = trimmedQuery;
        return;
      }

      // 2. If backspacing (e.g. "Apple" -> "App"), do nothing (keep the longer version)
      if (lowerLast.startsWith(lowerQuery)) {
        return;
      }
    }

    // 3. Standard add (remove duplicates, add to top)
    const newHistory = this.searchHistory.filter(
      (item) => item.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    newHistory.unshift(trimmedQuery);
    this.searchHistory = newHistory.slice(0, 10);
  }

  removeFromHistory(query: string) {
    this.searchHistory = this.searchHistory.filter((item) => item !== query);
  }

  clearHistory() {
    this.searchHistory = [];
  }
}

export default ProductStore;
