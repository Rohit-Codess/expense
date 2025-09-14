import { Document } from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: string;
  phoneNumber: string;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Interface
export interface ICategory extends Document {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense Interface
export interface IExpense extends Document {
  _id: string;
  title: string;
  amount: number;
  category: string | ICategory;
  date: Date;
  notes?: string;
  photoUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request Types
export interface SendOTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
  notes?: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    isVerified: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  iat?: number;
  exp?: number;
}

// Express Request with User
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phoneNumber: string;
  };
}