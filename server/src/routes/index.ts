import { Router } from 'express';
import authRoutes from './auth';
import categoryRoutes from './categories';
import expenseRoutes from './expenses';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/expenses', expenseRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;