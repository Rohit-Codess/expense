import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import User from '../models/User';
import Category from '../models/Category';

// Initialize Twilio client only if credentials are properly configured
let client: twilio.Twilio | null = null;
if (
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
  process.env.TWILIO_ACCOUNT_SID !== 'your-twilio-account-sid'
) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn('⚠️  Twilio credentials not configured. SMS functionality will be disabled.');
  console.warn('   To enable SMS OTP, update your .env file with valid Twilio credentials.');
}

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d'
  });
};

// Create default categories for new users
const createDefaultCategories = async (userId: string): Promise<void> => {
  try {
    const defaultCategories = [
      { name: 'Food', color: '#10B981', icon: '🍽️' },
      { name: 'Travel', color: '#3B82F6', icon: '✈️' },
      { name: 'Stationery', color: '#F59E0B', icon: '📝' },
      { name: 'Fast Food', color: '#EF4444', icon: '🍕' },
      { name: 'Shopping', color: '#8B5CF6', icon: '🛍️' },
      { name: 'Entertainment', color: '#EC4899', icon: '🎬' },
    ];

    const categories = defaultCategories.map(cat => ({
      ...cat,
      userId
    }));

    await Category.insertMany(categories);
    console.log(`✅ Created ${categories.length} default categories for user ${userId}`);
  } catch (error) {
    console.error('Error creating default categories:', error);
    // Don't throw error as this is not critical for user authentication
  }
};

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
      return;
    }

    // Validate phone number format (should include country code)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please include country code (e.g., +1234567890)'
      });
      return;
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user with phone number
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({
        phoneNumber,
        otp,
        otpExpires,
        isVerified: false
      });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();

    // Send OTP via Twilio (if configured) or simulate for development
    try {
      if (client && process.env.TWILIO_PHONE_NUMBER) {
        await client.messages.create({
          body: `Your PocketLedger verification code is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        res.status(200).json({
          success: true,
          message: 'OTP sent successfully',
          data: {
            phoneNumber: phoneNumber.replace(/.(?=.{4})/g, '*') // Mask phone number
          }
        });
      } else {
        // Development mode - log OTP to console instead of sending SMS
        console.log('🔐 Development Mode - OTP for', phoneNumber, ':', otp);
        console.log('📝 Use this OTP to verify your phone number');
        
        res.status(200).json({
          success: true,
          message: 'OTP generated successfully (Check server console for development OTP)',
          data: {
            phoneNumber: phoneNumber.replace(/.(?=.{4})/g, '*'),
            developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
          }
        });
      }
    } catch (twilioError: any) {
      console.error('Twilio error:', twilioError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please check your phone number and try again.'
      });
    }
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
      return;
    }

    // Find user with phone number (include OTP fields for verification)
    const user = await User.findOne({ phoneNumber }).select('+otp +otpExpires');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found. Please request a new OTP.'
      });
      return;
    }

    // Debug logging
    console.log('🔍 OTP Verification Debug:');
    console.log('📱 Phone Number:', phoneNumber);
    console.log('🔢 Received OTP:', otp, '(type:', typeof otp, ')');
    console.log('💾 Stored OTP:', user.otp, '(type:', typeof user.otp, ')');
    console.log('⏰ OTP Expires:', user.otpExpires);
    console.log('🕒 Current Time:', new Date());

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      console.log('❌ OTP Mismatch: stored=' + user.otp + ', received=' + otp);
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
      return;
    }

    // Mark user as verified and clear OTP
    const isNewUser = !user.isVerified;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create default categories for new users
    if (isNewUser) {
      await createDefaultCategories(user._id.toString());
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Convert Mongoose document to plain object for type-safe property access
    const safeUser = (user as any).toObject ? (user as any).toObject() : (user as any);

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        token,
        user: {
          id: safeUser._id,
          phoneNumber: safeUser.phoneNumber,
          isVerified: safeUser.isVerified,
          createdAt: safeUser.createdAt
        }
      }
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCurrentUser = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};