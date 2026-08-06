import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import {
  createCategoryValidator,
  updateCategoryValidator,
} from '../validators/category.validator.js';

const router = Router();

// Public Routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin-only Routes
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingleImage('image'),
  validate(createCategoryValidator),
  createCategory
);

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingleImage('image'),
  validate(updateCategoryValidator),
  updateCategory
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCategory
);

export default router;
