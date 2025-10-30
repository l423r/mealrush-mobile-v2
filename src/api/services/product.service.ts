import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductCategory,
  PaginatedResponse,
} from '../../types/api.types';

export const productService = {
  getAll: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(MY_FOOD_ENDPOINTS.PRODUCTS, {
      params: { page, size },
    }),

  searchByName: (name: string, page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(
      MY_FOOD_ENDPOINTS.PRODUCT_SEARCH_NAME,
      {
        params: { name, page, size },
      }
    ),

  searchByBarcode: (barcode: string, page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(
      `${MY_FOOD_ENDPOINTS.PRODUCT_SEARCH_BARCODE}/${barcode}`,
      {
        params: { page, size },
      }
    ),

  create: (productData: ProductCreate) =>
    apiClient.post<Product>(MY_FOOD_ENDPOINTS.PRODUCTS, productData),

  getById: (id: number) =>
    apiClient.get<Product>(`${MY_FOOD_ENDPOINTS.PRODUCTS}/${id}`),

  update: (id: number, productData: ProductUpdate) =>
    apiClient.put<Product>(`${MY_FOOD_ENDPOINTS.PRODUCTS}/${id}`, productData),

  delete: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.PRODUCTS}/${id}`),

  // Aliases for backward compatibility
  createProduct: (productData: ProductCreate) =>
    apiClient.post<Product>(MY_FOOD_ENDPOINTS.PRODUCTS, productData),

  updateProduct: (id: number, productData: ProductUpdate) =>
    apiClient.put<Product>(`${MY_FOOD_ENDPOINTS.PRODUCTS}/${id}`, productData),

  deleteProduct: (id: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.PRODUCTS}/${id}`),

  getCategories: (page: number = 0, size: number = 100) =>
    apiClient.get<PaginatedResponse<ProductCategory>>(
      MY_FOOD_ENDPOINTS.PRODUCT_CATEGORIES,
      {
        params: { page, size },
      }
    ),

  getFavorites: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(MY_FOOD_ENDPOINTS.FAVORITES, {
      params: { page, size },
    }),

  addToFavorites: (productId: number) =>
    apiClient.post(`${MY_FOOD_ENDPOINTS.FAVORITES}/${productId}`),

  removeFromFavorites: (productId: number) =>
    apiClient.delete(`${MY_FOOD_ENDPOINTS.FAVORITES}/${productId}`),
};
