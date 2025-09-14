// User and Authentication Types
export interface User {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}

// Expense Types
export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  category?: Category;
  date: string;
  description?: string;
  photoUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  description?: string;
  photo?: File;
}

export interface UpdateExpenseRequest {
  id: string;
  title?: string;
  amount?: number;
  categoryId?: string;
  date?: string;
  description?: string;
  photo?: File;
}

export interface ExpenseFilters {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Dashboard Types
export interface ExpenseSummary {
  totalExpenses: number;
  monthlyExpenses: number;
  categoryBreakdown: CategoryExpense[];
  recentTransactions: Expense[];
}

export interface CategoryExpense {
  category: Category;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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

// Form Types
export interface ExpenseFormValues {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
  description: string;
  photo?: File;
}

export interface CategoryFormValues {
  name: string;
  color: string;
  icon: string;
}

export interface LoginFormValues {
  phoneNumber: string;
}

export interface OTPFormValues {
  otp: string[];
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Utility Types
export type ThemeColors = 
  | 'green' 
  | 'blue' 
  | 'yellow' 
  | 'orange' 
  | 'red' 
  | 'purple' 
  | 'pink' 
  | 'indigo';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Error Types
export interface AppError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}