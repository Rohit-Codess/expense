import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
  getExpenseById,
  getExpenseStats,
  getExpenseSummary
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All expense routes require authentication
router.use(authenticate);

router.get('/summary', getExpenseSummary);
router.get('/stats', getExpenseStats);
router.get('/', getExpenses);
router.post('/', upload.single('receipt'), createExpense);
router.get('/:id', getExpenseById);
router.put('/:id', upload.single('receipt'), updateExpense);
router.delete('/:id', deleteExpense);

export default router;