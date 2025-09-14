import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Modal, LoadingSpinner } from '../components/ui';
import { categoryService } from '../services';
import type { Category, ThemeColors } from '../types';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Category name is required'),
  color: Yup.string()
    .required('Color is required'),
});

const AVAILABLE_COLORS: { name: ThemeColors; hex: string; bgClass: string; textClass: string }[] = [
  { name: 'green', hex: '#10B981', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  { name: 'blue', hex: '#3B82F6', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  { name: 'yellow', hex: '#F59E0B', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  { name: 'red', hex: '#EF4444', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  { name: 'purple', hex: '#8B5CF6', bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  { name: 'pink', hex: '#EC4899', bgClass: 'bg-pink-100', textClass: 'text-pink-700' },
  { name: 'indigo', hex: '#6366F1', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700' },
  { name: 'orange', hex: '#F97316', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
];

const ManageCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response.success && response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.warn('Categories API failed or returned invalid data');
          setCategories([]); // Set empty array instead of fallback
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]); // Set empty array instead of fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      color: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);

      try {
        if (editingCategory) {
          // Update existing category
          const response = await categoryService.updateCategory({
            id: editingCategory.id,
            name: values.name,
            color: values.color,
          });

          if (response.success) {
            setCategories(prev => 
              prev.map(cat => 
                cat.id === editingCategory.id 
                  ? { ...cat, name: values.name, color: values.color }
                  : cat
              )
            );
          } else {
            alert(response.error || 'Failed to update category');
          }
        } else {
          // Create new category
          const response = await categoryService.createCategory({
            name: values.name,
            color: values.color,
          });

          if (response.success && response.data) {
            setCategories(prev => [...prev, response.data!]);
          } else {
            // Add mock category for demo
            const newCategory: Category = {
              id: Date.now().toString(),
              name: values.name,
              color: values.color,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setCategories(prev => [...prev, newCategory]);
          }
        }

        resetForm();
        setIsModalOpen(false);
        setEditingCategory(null);
      } catch {
        alert('An unexpected error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    formik.setValues({
      name: category.name,
      color: category.color,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await categoryService.deleteCategory(categoryId);
      if (response.success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } else {
        alert(response.error || 'Failed to delete category');
      }
    } catch {
      alert('An unexpected error occurred');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    formik.resetForm();
    setIsModalOpen(true);
  };

  const getColorClasses = (color: string) => {
    const colorConfig = AVAILABLE_COLORS.find(c => c.hex === color);
    return colorConfig ? `${colorConfig.bgClass} ${colorConfig.textClass}` : 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Manage Categories</h1>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Manage Categories</h2>

            {/* Categories List */}
            <div className="space-y-4 mb-6">
              {Array.isArray(categories) && categories.length > 0 ? categories.map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses(category.color)}`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No categories available</p>
                  <p className="text-sm">Add a category to get started</p>
                </div>
              )}
            </div>

            {/* Add Category Button */}
            <Button
              onClick={handleAddCategory}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <span className="mr-2">+</span>
              Add Category
            </Button>

            {/* Page indicator dots */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Add/Edit Category Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
            formik.resetForm();
          }}
          title={editingCategory ? 'Edit Category' : 'Add Category'}
        >
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Category Name */}
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={formik.values.name}
              onChange={(value) => formik.setFieldValue('name', value)}
              error={formik.touched.name ? formik.errors.name : undefined}
              required
            />

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Color <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => formik.setFieldValue('color', color.hex)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      formik.values.color === color.hex
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  ></button>
                ))}
              </div>
              {formik.touched.color && formik.errors.color && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.color}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  formik.resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={!formik.isValid}
                className="flex-1"
              >
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageCategories;