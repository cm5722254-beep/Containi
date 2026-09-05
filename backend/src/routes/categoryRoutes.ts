import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, requireAdmin, createCategory);

export default router;
