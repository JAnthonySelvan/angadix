import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { mongoIdParamValidator } from '../../validators/admin.validator.js';
import {
  getAdminUsers,
  toggleUserBlock,
  updateUserRole,
  getUserOrders,
} from '../../controllers/admin/user.admin.controller.js';

const router = Router();

router.get('/', getAdminUsers);
router.get('/:id/orders', validate(mongoIdParamValidator), getUserOrders);
router.patch('/:id/block', validate(mongoIdParamValidator), toggleUserBlock);
router.patch('/:id/role', validate(mongoIdParamValidator), updateUserRole);

export default router;
