import { Request, Response } from 'express';
import Category from '../models/Category';
import mongoose from 'mongoose';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const categories = await Category.find({ userId }).sort({ createdAt: -1 });

    // Transform categories to match client interface
    const transformedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: transformedCategories
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, color, icon } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!name || !color) {
      res.status(400).json({
        success: false,
        message: 'Name and color are required'
      });
      return;
    }

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({ name, userId });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
      return;
    }

    const category = new Category({
      name: name.trim(),
      color,
      icon,
      userId
    });

    await category.save();

    // Transform category to match client interface
    const transformedCategory = {
      id: category._id.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: transformedCategory
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, color, icon } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
      return;
    }

    if (!name || !color) {
      res.status(400).json({
        success: false,
        message: 'Name and color are required'
      });
      return;
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // Check if another category with same name already exists for this user
    const existingCategory = await Category.findOne({ 
      name: name.trim(), 
      userId, 
      _id: { $ne: id } 
    });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
      return;
    }

    // Update category
    category.name = name.trim();
    category.color = color;
    if (icon !== undefined) {
      // Use Document.set to avoid TypeScript error when model interface doesn't include 'icon'
      category.set('icon', icon);
    }
    category.updatedAt = new Date();

    await category.save();

    // Transform category to match client interface
    const transformedCategory = {
      id: category._id.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: transformedCategory
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
      return;
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // TODO: Check if category is being used by any expenses
    // For now, we'll allow deletion - in production you might want to:
    // 1. Prevent deletion if expenses exist
    // 2. Move expenses to "Uncategorized" category
    // 3. Ask user what to do with existing expenses

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
      return;
    }

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // Transform category to match client interface
    const transformedCategory = {
      id: category._id.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      data: transformedCategory
    });
  } catch (error: any) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};