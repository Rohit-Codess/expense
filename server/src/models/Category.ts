import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '../types';

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  icon: {
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

// Compound index for user-specific categories with unique names
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });
CategorySchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to ensure category name is unique per user
CategorySchema.pre('save', async function(this: ICategory, next) {
  if (this.isNew || this.isModified('name')) {
    const CategoryModel = this.constructor as Model<ICategory>;
    const existingCategory = await CategoryModel.findOne({
      userId: this.userId,
      name: this.name,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      const error = new Error('Category name already exists for this user');
      return next(error);
    }
  }
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema);