import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Select, LoadingSpinner } from '../components/ui';
import { expenseService, categoryService } from '../services';
import type { Category } from '../types';

const validationSchema = Yup.object({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .required('Title is required'),
  amount: Yup.number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  categoryId: Yup.string()
    .required('Category is required'),
  date: Yup.string()
    .required('Date is required'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters'),
});

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        const response = await expenseService.createExpense({
          title: values.title,
          amount: parseFloat(values.amount),
          categoryId: values.categoryId,
          date: values.date,
          description: values.description || undefined,
          photo: selectedPhoto || undefined,
        });

        if (response.success) {
          navigate('/dashboard');
        } else {
          alert(response.error || 'Failed to create expense');
        }
      } catch {
        alert('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  if (categoriesLoading) {
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
            <h1 className="text-lg font-semibold text-gray-800">Add Expense</h1>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Form */}
        <div className="p-4">
          {categories.length === 0 && !categoriesLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Categories Available</h3>
                <p className="text-gray-600 mb-4">You need to create categories first before adding expenses.</p>
                <Button
                  onClick={() => navigate('/manage-categories')}
                  variant="primary"
                  className="w-full"
                >
                  Create Categories
                </Button>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Title */}
              <Input
                label="Title"
                placeholder="₹"
                value={formik.values.title}
                onChange={(value) => formik.setFieldValue('title', value)}
                error={formik.touched.title ? formik.errors.title : undefined}
                required
              />

              {/* Amount */}
              <Input
                label="Amount"
                type="number"
                placeholder="Enter amount"
                value={formik.values.amount}
                onChange={(value) => formik.setFieldValue('amount', value)}
                error={formik.touched.amount ? formik.errors.amount : undefined}
                required
              />

              {/* Category */}
              <Select
                label="Category"
                placeholder="₹ Food"
                value={formik.values.categoryId}
                onChange={(value) => formik.setFieldValue('categoryId', value)}
                options={Array.isArray(categories) ? categories.map(cat => ({
                  value: cat.id,
                  label: cat.name,
                })) : []}
                error={formik.touched.categoryId ? formik.errors.categoryId : undefined}
                required
              />

              {/* Date */}
              <Input
                label="Date"
                type="date"
                value={formik.values.date}
                onChange={(value) => formik.setFieldValue('date', value)}
                error={formik.touched.date ? formik.errors.date : undefined}
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional: add details or description
                </label>
                <textarea
                  placeholder="Add notes or description..."
                  value={formik.values.description}
                  onChange={(e) => formik.setFieldValue('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📷 Upload photo (optional)
                </label>
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v1M7 4V3a1 1 0 011-1m0 0v12l4-4 4 4V4"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={!formik.isValid}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpense;