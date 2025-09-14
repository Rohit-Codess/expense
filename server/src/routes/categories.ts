import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryById 
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get('/', getCategories);
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;