import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code']
  },
  otp: {
    type: String,
    select: false // Don't include in queries by default
  },
  otpExpires: {
    type: Date,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Additional indexes for performance (phoneNumber already has unique index)
UserSchema.index({ createdAt: -1 });

// Instance method to check if OTP is valid
UserSchema.methods.isOTPValid = function(otp: string): boolean {
  return this.otp === otp && this.otpExpires && this.otpExpires > new Date();
};

// Static method to find user by phone number
UserSchema.statics.findByPhoneNumber = function(phoneNumber: string) {
  return this.findOne({ phoneNumber });
};

export default mongoose.model<IUser>('User', UserSchema);