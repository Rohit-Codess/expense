import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner } from '../components/ui';
import { expenseService, authService } from '../services';
import { formatCurrency } from '../utils/helpers';
import type { ExpenseSummary } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await expenseService.getExpenseSummary();
      
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        throw new Error(response.error || 'Failed to load dashboard data');
      }
    } catch (error: unknown) {
      console.error('Dashboard loading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await authService.logout();
      navigate('/login');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
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
        return 'bg-green-100 text-green-700 border-green-200';
      case '#3B82F6':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '#F59E0B':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case '#EF4444':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
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
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!summary || (summary.categoryBreakdown.length === 0 && summary.recentTransactions.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto">
          {/* Header with Logout */}
          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">PocketLedger</h1>
                <p className="text-sm text-gray-600">Welcome back!</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className="p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Expenses Yet</h2>
              <p className="text-gray-600 mb-6">Start tracking your expenses by adding your first expense</p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/add-expense')}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <span className="mr-2">+</span>
                  Add Your First Expense
                </Button>
                
                <Button
                  onClick={() => navigate('/manage-categories')}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Manage Categories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header with Logout */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">PocketLedger</h1>
              <p className="text-sm text-gray-600">Welcome back!</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Left Panel - Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 mx-4 mt-4">
          {/* Monthly Total */}
          <div className="bg-blue-100 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-1">This month</h3>
            <h2 className="text-3xl font-bold text-blue-900">
              {formatCurrency(summary?.monthlyExpenses || 0)}
            </h2>
          </div>

          {/* Category Circles */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {summary?.categoryBreakdown.map((category) => (
              <div
                key={category.category.id}
                className={`relative p-4 rounded-2xl border-2 ${getCategoryColor(category.category.color)}`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{getCategoryIcon(category.category.name)}</div>
                  <h4 className="font-medium text-sm">{category.category.name}</h4>
                  <p className="text-lg font-bold">{formatCurrency(category.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Recent Transactions</h3>
            <div className="space-y-3">
              {summary?.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category?.color || '#10B981')}`}>
                      <span className="text-sm">{getCategoryIcon(transaction.category?.name || 'Other')}</span>
                    </div>
                    <span className="font-medium text-gray-800">{transaction.title}</span>
                  </div>
                  <span className="font-semibold text-red-600">- {formatCurrency(transaction.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Categories & Add Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-4">
          {/* Navigation Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/add-expense')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <span className="mr-2">+</span>
              Add Expense
            </Button>
            
            <Button
              onClick={() => navigate('/expenses')}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              View All Expenses
            </Button>
            
            <Button
              onClick={() => navigate('/manage-categories')}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Manage Categories
            </Button>
          </div>

          {/* Page indicator dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;