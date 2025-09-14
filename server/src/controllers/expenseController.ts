import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Category from '../models/Category';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { ICategory } from '../types';

// Type for expense with populated category
interface PopulatedExpense {
  _id: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  categoryId: ICategory;
  date: Date;
  receiptUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<void>;
  populate: (path: string, select?: string) => Promise<PopulatedExpense>;
}

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { page = '1', limit = '10', category, startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = { userId };

    if (category && category !== 'all') {
      filter.categoryId = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const expenses = await Expense.find(filter)
      .populate('categoryId', 'name color icon')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalExpenses = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(totalExpenses / limitNum);

    // Calculate total amount for filtered expenses
    const totalAmountResult = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Transform expenses to match client interface
    const transformedExpenses = expenses.map(expense => {
      const populatedExpense = expense as any;
      return {
        id: expense._id.toString(),
        title: expense.description, // The database description is used as title
        amount: expense.amount,
        categoryId: populatedExpense.categoryId?._id?.toString() || expense.categoryId?.toString(),
        category: populatedExpense.categoryId ? {
          id: populatedExpense.categoryId._id?.toString() || '',
          name: populatedExpense.categoryId.name || '',
          color: populatedExpense.categoryId.color || '#10B981',
          createdAt: populatedExpense.categoryId.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: populatedExpense.categoryId.updatedAt?.toISOString() || new Date().toISOString()
        } : undefined,
        date: expense.date.toISOString(),
        description: '', // Keep description empty since we store title in database description field
        photoUrl: expense.receiptUrl,
        userId: expense.userId,
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString()
      };
    });

    res.status(200).json({
      success: true,
      data: {
        expenses: transformedExpenses,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalExpenses,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        summary: {
          totalAmount,
          averageAmount: totalExpenses > 0 ? totalAmount / totalExpenses : 0
        }
      }
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { amount, description, categoryId, date } = req.body;
    const receipt = req.file;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!amount || !description || !categoryId) {
      res.status(400).json({
        success: false,
        message: 'Amount, description, and category are required'
      });
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
      return;
    }

    // Validate category exists and belongs to user
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
      return;
    }

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    const expense = new Expense({
      amount: amountNum,
      description: description.trim(),
      categoryId,
      userId,
      date: date ? new Date(date) : new Date(),
      receiptUrl: receipt ? `/uploads/${receipt.filename}` : undefined
    });

    console.log('Creating expense:', {
      amount: amountNum,
      description: description.trim(),
      categoryId,
      userId,
      date: date ? new Date(date) : new Date()
    });

    await expense.save();
    console.log('Expense saved successfully:', expense._id);

    // Populate category info for response
    await expense.populate('categoryId', 'name color icon');

    // Type assertion for populated expense
    const populatedExpense = expense as any as PopulatedExpense;

    // Check if categoryId is properly populated
    if (!populatedExpense.categoryId || typeof populatedExpense.categoryId === 'string') {
      res.status(500).json({
        success: false,
        message: 'Failed to populate category information'
      });
      return;
    }

    // Transform expense to match client interface
    const transformedExpense = {
      id: expense._id.toString(),
      title: expense.description, // Database description field is used as title
      amount: expense.amount,
      categoryId: populatedExpense.categoryId._id?.toString() || '',
      category: {
        id: populatedExpense.categoryId._id?.toString() || '',
        name: populatedExpense.categoryId.name || '',
        color: populatedExpense.categoryId.color || '#10B981',
        createdAt: populatedExpense.categoryId.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: populatedExpense.categoryId.updatedAt?.toISOString() || new Date().toISOString()
      },
      date: expense.date.toISOString(),
      description: '', // Keep description empty since we store title in database description field
      photoUrl: expense.receiptUrl,
      userId: expense.userId.toString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: transformedExpense
    });
  } catch (error: any) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { amount, description, categoryId, date } = req.body;
    const receipt = req.file;

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
        message: 'Invalid expense ID'
      });
      return;
    }

    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
      return;
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
        return;
      }
      expense.amount = amountNum;
    }

    // Validate category if provided
    if (categoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
        return;
      }

      const category = await Category.findOne({ _id: categoryId, userId });
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }
      expense.categoryId = categoryId;
    }

    // Update other fields
    if (description !== undefined) {
      expense.description = description.trim();
    }

    if (date !== undefined) {
      expense.date = new Date(date);
    }

    // Handle receipt update
    if (receipt) {
      // Delete old receipt if exists
      if (expense.receiptUrl) {
        const oldReceiptPath = path.join(process.cwd(), 'uploads', path.basename(expense.receiptUrl));
        if (fs.existsSync(oldReceiptPath)) {
          fs.unlinkSync(oldReceiptPath);
        }
      }
      expense.receiptUrl = `/uploads/${receipt.filename}`;
    }

    expense.updatedAt = new Date();
    await expense.save();

    // Populate category info for response
    await expense.populate('categoryId', 'name color icon');

    // Type assertion for populated expense
    const populatedExpense = expense as any as PopulatedExpense;

    // Check if categoryId is properly populated
    if (!populatedExpense.categoryId || typeof populatedExpense.categoryId === 'string') {
      res.status(500).json({
        success: false,
        message: 'Failed to populate category information'
      });
      return;
    }

    // Transform expense to match client interface
    const transformedExpense = {
      id: expense._id.toString(),
      title: expense.description, // Database description field is used as title
      amount: expense.amount,
      categoryId: populatedExpense.categoryId._id?.toString() || '',
      category: {
        id: populatedExpense.categoryId._id?.toString() || '',
        name: populatedExpense.categoryId.name || '',
        color: populatedExpense.categoryId.color || '#10B981',
        createdAt: populatedExpense.categoryId.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: populatedExpense.categoryId.updatedAt?.toISOString() || new Date().toISOString()
      },
      date: expense.date.toISOString(),
      description: '', // Keep description empty since we store title in database description field
      photoUrl: expense.receiptUrl,
      userId: expense.userId.toString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: transformedExpense
    });
  } catch (error: any) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Invalid expense ID'
      });
      return;
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
      return;
    }

    // Delete receipt file if exists
    if (expense.receiptUrl) {
      const receiptPath = path.join(process.cwd(), 'uploads', path.basename(expense.receiptUrl));
      if (fs.existsSync(receiptPath)) {
        fs.unlinkSync(receiptPath);
      }
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Invalid expense ID'
      });
      return;
    }

    const expense = await Expense.findOne({ _id: id, userId })
      .populate('categoryId', 'name color icon');

    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
      return;
    }

    // Type assertion for populated expense
    const populatedExpense = expense as any as PopulatedExpense;

    // Check if categoryId is properly populated
    if (!populatedExpense.categoryId || typeof populatedExpense.categoryId === 'string') {
      res.status(500).json({
        success: false,
        message: 'Failed to populate category information'
      });
      return;
    }

    // Transform expense to match client interface
    const transformedExpense = {
      id: expense._id.toString(),
      title: expense.description, // Database description field is used as title
      amount: expense.amount,
      categoryId: populatedExpense.categoryId._id?.toString() || '',
      category: {
        id: populatedExpense.categoryId._id?.toString() || '',
        name: populatedExpense.categoryId.name || '',
        color: populatedExpense.categoryId.color || '#10B981',
        createdAt: populatedExpense.categoryId.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: populatedExpense.categoryId.updatedAt?.toISOString() || new Date().toISOString()
      },
      date: expense.date.toISOString(),
      description: '', // Keep description empty since we store title in database description field
      photoUrl: expense.receiptUrl,
      userId: expense.userId.toString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      data: transformedExpense
    });
  } catch (error: any) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getExpenseSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    console.log('Getting expense summary for user:', userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get total expenses (all time)
    const totalExpensesResult = await Expense.aggregate([
      {
        $match: {
          userId: userId // Use string instead of ObjectId
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly expenses (current month)
    const monthlyExpensesResult = await Expense.aggregate([
      {
        $match: {
          userId: userId, // Use string instead of ObjectId
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get category breakdown for current month
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: userId, // Use string instead of ObjectId
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$categoryId',
          category: { $first: '$category' },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    // Get recent transactions (last 5)
    const recentTransactions = await Expense.find({ userId })
      .populate('categoryId', 'name color icon')
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
    const monthlyExpenses = monthlyExpensesResult.length > 0 ? monthlyExpensesResult[0].total : 0;

    console.log('Monthly expenses calculated:', monthlyExpenses);

    // Calculate percentages for category breakdown
    const categoryBreakdownWithPercentages = categoryBreakdown.map(item => ({
      category: {
        id: item._id.toString(),
        name: item.category.name,
        color: item.category.color,
        createdAt: item.category.createdAt,
        updatedAt: item.category.updatedAt
      },
      totalAmount: item.totalAmount,
      transactionCount: item.transactionCount,
      percentage: monthlyExpenses > 0 ? Math.round((item.totalAmount / monthlyExpenses) * 100) : 0
    }));

    // Format recent transactions
    const formattedRecentTransactions = recentTransactions.map(expense => {
      // Type assertion for populated expense
      const populatedExpense = expense as any as PopulatedExpense;
      
      // Check if categoryId is properly populated
      if (!populatedExpense.categoryId || typeof populatedExpense.categoryId === 'string') {
        // Skip this expense if category is not populated
        return null;
      }
      
      return {
        id: expense._id.toString(),
        title: expense.description, // Use description as title
        amount: expense.amount,
        categoryId: populatedExpense.categoryId._id?.toString() || '',
        category: {
          id: populatedExpense.categoryId._id?.toString() || '',
          name: populatedExpense.categoryId.name || '',
          color: populatedExpense.categoryId.color || '#10B981',
          createdAt: populatedExpense.categoryId.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: populatedExpense.categoryId.updatedAt?.toISOString() || new Date().toISOString()
        },
        date: expense.date.toISOString(),
        userId: expense.userId.toString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString()
      };
    }).filter(Boolean); // Remove null entries

    const summary = {
      totalExpenses,
      monthlyExpenses,
      categoryBreakdown: categoryBreakdownWithPercentages,
      recentTransactions: formattedRecentTransactions
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.error('Get expense summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getExpenseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { period = 'month' } = req.query; // month, week, year

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get total expenses for period
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$categoryId',
          name: { $first: '$category.name' },
          color: { $first: '$category.color' },
          icon: { $first: '$category.icon' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get daily expenses for the period (for chart data)
    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const stats = {
      totalAmount: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      totalCount: totalExpenses.length > 0 ? totalExpenses[0].count : 0,
      averagePerDay: 0,
      expensesByCategory,
      dailyExpenses,
      period,
      startDate,
      endDate: now
    };

    // Calculate average per day
    const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    stats.averagePerDay = daysDiff > 0 ? stats.totalAmount / daysDiff : 0;

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};