import { Router } from 'express';
import {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import {
  createBrandValidator,
  updateBrandValidator,
} from '../validators/brand.validator.js';

const router = Router();

// Public Routes
router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

// Admin-only Routes
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingleImage('logo'),
  validate(createBrandValidator),
  createBrand
);

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingleImage('logo'),
  validate(updateBrandValidator),
  updateBrand
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteBrand
);

export default router;
