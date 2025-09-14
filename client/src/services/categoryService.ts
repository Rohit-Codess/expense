import { apiService } from './apiService';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export class CategoryService {
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return apiService.get('/categories');
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiService.get(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiService.post('/categories', data);
  }

  async updateCategory(data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    const { id, ...updateData } = data;
    return apiService.put(`/categories/${id}`, updateData);
  }

  async deleteCategory(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/categories/${id}`);
  }

  async getCategoriesWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Category>>> {
    return apiService.get(`/categories?page=${page}&limit=${limit}`);
  }
}

export const categoryService = new CategoryService();