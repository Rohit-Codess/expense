import { apiService } from './apiService';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ExpenseSummary,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export class ExpenseService {
  async getAllExpenses(
    page: number = 1,
    limit: number = 10,
    filters?: ExpenseFilters
  ): Promise<ApiResponse<PaginatedResponse<Expense>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return apiService.get(`/expenses?${params.toString()}`);
  }

  async getExpenseById(id: string): Promise<ApiResponse<Expense>> {
    return apiService.get(`/expenses/${id}`);
  }

  async createExpense(data: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
    if (data.photo) {
      // Handle file upload
      const formData = new FormData();
      formData.append('description', data.title); // Map title to description
      formData.append('amount', data.amount.toString());
      formData.append('categoryId', data.categoryId);
      formData.append('date', data.date);
      if (data.description) {
        formData.append('description', data.description); // Override with description if provided
      }
      formData.append('photo', data.photo);

      return apiService.postFormData('/expenses', formData);
    } else {
      // Regular JSON request - map title to description
      const requestData = {
        description: data.description || data.title, // Use description if provided, otherwise use title
        amount: data.amount,
        categoryId: data.categoryId,
        date: data.date
      };
      return apiService.post('/expenses', requestData);
    }
  }

  async updateExpense(data: UpdateExpenseRequest): Promise<ApiResponse<Expense>> {
    const { id, photo, title, description, ...otherData } = data;
    
    // Map title to description for server compatibility
    const updateData = {
      ...otherData,
      description: description || title // Use description if provided, otherwise use title
    };
    
    if (photo) {
      // Handle file upload
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      formData.append('photo', photo);

      return apiService.postFormData(`/expenses/${id}`, formData);
    } else {
      // Regular JSON request
      return apiService.put(`/expenses/${id}`, updateData);
    }
  }

  async deleteExpense(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/expenses/${id}`);
  }

  async getExpenseSummary(): Promise<ApiResponse<ExpenseSummary>> {
    return apiService.get('/expenses/summary');
  }

  async getRecentExpenses(limit: number = 5): Promise<ApiResponse<Expense[]>> {
    return apiService.get(`/expenses/recent?limit=${limit}`);
  }

  async getExpensesByCategory(categoryId: string): Promise<ApiResponse<Expense[]>> {
    return apiService.get(`/expenses/category/${categoryId}`);
  }

  async getExpensesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Expense[]>> {
    return apiService.get(`/expenses/date-range?start=${startDate}&end=${endDate}`);
  }

  async getMonthlyExpenses(year: number, month: number): Promise<ApiResponse<Expense[]>> {
    return apiService.get(`/expenses/monthly?year=${year}&month=${month}`);
  }
}

export const expenseService = new ExpenseService();