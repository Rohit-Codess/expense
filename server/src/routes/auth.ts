import { Router } from 'express';
import { sendOTP, verifyOTP, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;