import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWTPayload } from '../types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        phoneNumber: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error.'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-otp -otpExpires');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Account not verified. Please verify your phone number.'
      });
      return;
    }

    // Add user to request object
    req.user = {
      userId: user._id.toString(), // Convert ObjectId to string
      phoneNumber: user.phoneNumber
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
      return;
    }

    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-otp -otpExpires');
    
    if (user && user.isVerified) {
      req.user = {
        userId: user._id.toString(), // Convert ObjectId to string
        phoneNumber: user.phoneNumber
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};