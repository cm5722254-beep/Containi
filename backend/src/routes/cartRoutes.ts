import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
} from '../controllers/cartController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All cart endpoints require user authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);

export default router;
