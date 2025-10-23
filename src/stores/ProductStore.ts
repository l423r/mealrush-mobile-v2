import { makeAutoObservable, runInAction } from 'mobx';
import { productService } from '../api/services/product.service';
import RootStore from './RootStore';
import { Product, ProductCreate, ProductUpdate, ProductCategory, PaginatedResponse } from '../types/api.types';

class ProductStore {
  rootStore: RootStore;
  
  // State
  products: Product[] = [];
  categories: ProductCategory[] = [];
  favorites: Product[] = [];
  searchQuery: string = '';
  loading: boolean = false;
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

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Actions
  async searchProducts(query: string, page: number = 0) {
    if (!query.trim()) {
      this.products = [];
      return;
    }

    this.loading = true;
    this.error = null;
    this.searchQuery = query;
    
    try {
      const response = await productService.searchByName(query, page, this.pagination.size);
      
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
        
        this.loading = false;
        this.error = null;
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка поиска продуктов';
      });
      throw error;
    }
  }

  async getAll(page: number = 0) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await productService.getAll(page, this.pagination.size);
      
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
        
        this.loading = false;
        this.error = null;
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка загрузки продуктов';
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
        this.products = [response.data, ...this.products];
        this.loading = false;
        this.error = null;
      });
      
      return response.data;
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка создания продукта';
      });
      throw error;
    }
  }

  async updateProduct(productData: ProductUpdate) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await productService.updateProduct(productData);
      
      runInAction(() => {
        const index = this.products.findIndex(p => p.id === productData.id);
        if (index !== -1) {
          this.products[index] = response.data;
        }
        this.loading = false;
        this.error = null;
      });
      
      return response.data;
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка обновления продукта';
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
        this.products = this.products.filter(p => p.id !== productId);
        this.favorites = this.favorites.filter(p => p.id !== productId);
        this.loading = false;
        this.error = null;
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка удаления продукта';
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
        this.error = error.response?.data?.message || 'Ошибка загрузки категорий';
      });
      throw error;
    }
  }

  async getFavorites() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await productService.getFavorites();
      
      runInAction(() => {
        this.favorites = response.data.content;
        this.loading = false;
        this.error = null;
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка загрузки избранного';
      });
      throw error;
    }
  }

  async addToFavorites(productId: number) {
    try {
      await productService.addToFavorites(productId);
      
      runInAction(() => {
        const product = this.products.find(p => p.id === productId);
        if (product && !this.favorites.find(f => f.id === productId)) {
          this.favorites.push(product);
        }
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка добавления в избранное';
      });
      throw error;
    }
  }

  async removeFromFavorites(productId: number) {
    try {
      await productService.removeFromFavorites(productId);
      
      runInAction(() => {
        this.favorites = this.favorites.filter(f => f.id !== productId);
      });
      
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка удаления из избранного';
      });
      throw error;
    }
  }

  clearSearch() {
    this.products = [];
    this.searchQuery = '';
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
    this.categories = [];
    this.favorites = [];
    this.searchQuery = '';
    this.loading = false;
    this.error = null;
    this.pagination = {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasMore: false,
    };
  }
}

export default ProductStore;