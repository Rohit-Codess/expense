import { apiService } from './apiService';
import type {
  LoginRequest,
  VerifyOTPRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '../types';

export class AuthService {
  async sendOTP(data: LoginRequest): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/auth/send-otp', data);
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>('/auth/verify-otp', data);
    
    // Store token if successful
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.get<User>('/auth/me');
      // If the API call fails due to invalid token, clear it
      if (!response.success) {
        this.logout();
      }
      return response;
    } catch (error) {
      // Clear token on any auth error
      this.logout();
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    // Call logout endpoint if needed
    await apiService.post('/auth/logout');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    // Optional: Add token expiry check here if you have JWT with exp claim
    try {
      // Basic token format validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid JWT format, remove it
        localStorage.removeItem('authToken');
        return false;
      }
      return true;
    } catch {
      // Invalid token, remove it
      localStorage.removeItem('authToken');
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();