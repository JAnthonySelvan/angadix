import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/auth.validator.js';

const router = Router();

// Apply auth protection to all user management routes
router.use(protect);

// User Self Profile Routes
router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileValidator), updateProfile);
router.patch('/change-password', validate(changePasswordValidator), changePassword);

// Admin-Only Routes
router.get('/', authorize('admin'), getAllUsers);

export default router;
