import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, Modal, Input, Select } from '../components/ui';
import { AppLayout } from '../components/layout';
import { expenseService, categoryService } from '../services';
import { formatCurrency } from '../utils/helpers';
import type { Expense, Category } from '../types';

interface ExpenseListResponse {
  expenses: Expense[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalExpenses: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const ExpenseList: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalExpenses: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Edit modal state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    categoryId: '',
    date: '',
    description: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal state
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load expenses and categories in parallel
      const [expensesResponse, categoriesResponse] = await Promise.all([
        expenseService.getAllExpenses(1, 10),
        categoryService.getAllCategories()
      ]);

      if (expensesResponse.success && expensesResponse.data) {
        const responseData = expensesResponse.data as unknown as ExpenseListResponse;
        setExpenses(responseData.expenses);
        const paginationData = responseData.pagination;
        setPagination({
          currentPage: paginationData.currentPage,
          totalPages: paginationData.totalPages,
          totalExpenses: paginationData.totalExpenses,
          hasNextPage: paginationData.hasNextPage,
          hasPrevPage: paginationData.hasPrevPage
        });
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error: unknown) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPage = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await expenseService.getAllExpenses(page, 10);
      
      if (response.success && response.data) {
        const responseData = response.data as unknown as ExpenseListResponse;
        setExpenses(responseData.expenses);
        const paginationData = responseData.pagination;
        setPagination({
          currentPage: paginationData.currentPage,
          totalPages: paginationData.totalPages,
          totalExpenses: paginationData.totalExpenses,
          hasNextPage: paginationData.hasNextPage,
          hasPrevPage: paginationData.hasPrevPage
        });
      }
    } catch (error: unknown) {
      console.error('Failed to load page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (expense: Expense) => {
    console.log('Editing expense:', expense); // Debug log
    setEditingExpense(expense);
    setEditForm({
      title: expense.title,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId,
      date: expense.date.split('T')[0], // Extract date part
      description: expense.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    // Check if expense has a valid ID
    if (!editingExpense.id) {
      console.error('Expense ID is missing:', editingExpense);
      alert('Error: Expense ID is missing. Please refresh the page and try again.');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await expenseService.updateExpense({
        id: editingExpense.id,
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        categoryId: editForm.categoryId,
        date: editForm.date,
        description: editForm.description
      });

      if (response.success) {
        setIsEditModalOpen(false);
        setEditingExpense(null);
        await loadData(); // Reload data
      } else {
        throw new Error(response.error || 'Failed to update expense');
      }
    } catch (error: unknown) {
      console.error('Failed to update expense:', error);
      alert(error instanceof Error ? error.message : 'Failed to update expense');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (expense: Expense) => {
    console.log('Deleting expense:', expense); // Debug log
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;

    // Check if expense has a valid ID
    if (!deletingExpense.id) {
      console.error('Expense ID is missing:', deletingExpense);
      alert('Error: Expense ID is missing. Please refresh the page and try again.');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await expenseService.deleteExpense(deletingExpense.id);

      if (response.success) {
        setIsDeleteModalOpen(false);
        setDeletingExpense(null);
        await loadData(); // Reload data
      } else {
        throw new Error(response.error || 'Failed to delete expense');
      }
    } catch (error: unknown) {
      console.error('Failed to delete expense:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'food':
        return '🍽️';
      case 'travel':
        return '✈️';
      case 'stationery':
        return '✏️';
      case 'fast food':
        return '🍔';
      default:
        return '💰';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case '#10B981':
        return 'bg-green-100 text-green-700';
      case '#3B82F6':
        return 'bg-blue-100 text-blue-700';
      case '#F59E0B':
        return 'bg-yellow-100 text-yellow-700';
      case '#EF4444':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  // Create select options for categories
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  return (
    <AppLayout showNavigation={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Expenses</h1>
                <p className="text-sm text-gray-600">{pagination.totalExpenses} total</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/add-expense')}
              variant="primary"
              size="sm"
            >
              <span className="mr-1">+</span>
              Add
            </Button>
          </div>
        </div>

        {/* Expense List */}
        <div className="p-4">
          {expenses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Expenses Found</h2>
              <p className="text-gray-600 mb-4">Start by adding your first expense</p>
              <Button
                onClick={() => navigate('/add-expense')}
                variant="primary"
              >
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={expense.id || `expense-${index}`} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(expense.category?.color || '#10B981')}`}>
                        <span className="text-lg">{getCategoryIcon(expense.category?.name || 'Other')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{expense.title}</h3>
                        <p className="text-sm text-gray-600">{expense.category?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                        {expense.description && (
                          <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right">
                        <p className="font-semibold text-red-600">-{formatCurrency(expense.amount)}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditClick(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Edit expense"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete expense"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => loadPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || isLoading}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                onClick={() => loadPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || isLoading}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Expense"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Title"
              value={editForm.title}
              onChange={(value) => setEditForm({ ...editForm, title: value })}
              required
            />
            
            <Input
              label="Amount"
              type="number"
              value={editForm.amount}
              onChange={(value) => setEditForm({ ...editForm, amount: value })}
              required
            />
            
            <Select
              label="Category"
              value={editForm.categoryId}
              onChange={(value) => setEditForm({ ...editForm, categoryId: value })}
              options={categoryOptions}
              required
            />
            
            <Input
              label="Date"
              type="date"
              value={editForm.date}
              onChange={(value) => setEditForm({ ...editForm, date: value })}
              required
            />
            
            <Input
              label="Description (optional)"
              value={editForm.description}
              onChange={(value) => setEditForm({ ...editForm, description: value })}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                variant="secondary"
                className="flex-1"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Expense"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{deletingExpense?.title}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                variant="secondary"
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
    </AppLayout>
  );
};

export default ExpenseList;