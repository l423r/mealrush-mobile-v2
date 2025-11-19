import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductCategory,
  PaginatedResponse,
} from '../../types/api.types';

export const productService = {
  getAll: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(ApiRoutes.Product.Base, {
      params: { page, size },
    }),

  searchByName: (name: string, page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(
      ApiRoutes.Product.SearchName,
      {
        params: { name, page, size },
      }
    ),

  searchByBarcode: (barcode: string, page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(
      `${ApiRoutes.Product.SearchBarcode}/${barcode}`,
      {
        params: { page, size },
      }
    ),

  create: (productData: ProductCreate) =>
    apiClient.post<Product>(ApiRoutes.Product.Base, productData),

  getById: (id: number) =>
    apiClient.get<Product>(`${ApiRoutes.Product.Base}/${id}`),

  update: (id: number, productData: ProductUpdate) =>
    apiClient.put<Product>(`${ApiRoutes.Product.Base}/${id}`, productData),

  delete: (id: number) =>
    apiClient.delete(`${ApiRoutes.Product.Base}/${id}`),

  // Aliases for backward compatibility
  createProduct: (productData: ProductCreate) =>
    apiClient.post<Product>(ApiRoutes.Product.Base, productData),

  updateProduct: (id: number, productData: ProductUpdate) =>
    apiClient.put<Product>(`${ApiRoutes.Product.Base}/${id}`, productData),

  deleteProduct: (id: number) =>
    apiClient.delete(`${ApiRoutes.Product.Base}/${id}`),

  getCategories: (page: number = 0, size: number = 100) =>
    apiClient.get<PaginatedResponse<ProductCategory>>(
      ApiRoutes.Product.Categories,
      {
        params: { page, size },
      }
    ),

  getFavorites: (page: number = 0, size: number = 20) =>
    apiClient.get<PaginatedResponse<Product>>(ApiRoutes.Favorites, {
      params: { page, size },
    }),

  addToFavorites: (productId: number) =>
    apiClient.post(`${ApiRoutes.Favorites}/${productId}`),

  removeFromFavorites: (productId: number) =>
    apiClient.delete(`${ApiRoutes.Favorites}/${productId}`),
};
