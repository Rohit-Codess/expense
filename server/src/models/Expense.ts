import mongoose, { Schema } from 'mongoose';

export interface IExpense extends mongoose.Document {
  _id: string;
  amount: number;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  date: Date;
  receiptUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Indexes for performance
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, categoryId: 1 });
ExpenseSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted amount
ExpenseSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

// Static method to get expenses by user and date range
ExpenseSchema.statics.findByUserAndDateRange = function(userId: string, startDate: Date, endDate: Date) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get monthly summary
ExpenseSchema.statics.getMonthlySum = function(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model<IExpense>('Expense', ExpenseSchema);