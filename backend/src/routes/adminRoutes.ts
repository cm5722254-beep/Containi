import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
