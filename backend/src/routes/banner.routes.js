import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBannerValidator,
  updateBannerValidator,
  reorderBannersValidator,
} from '../validators/banner.validator.js';
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from '../controllers/admin/banner.controller.js';

const router = Router();

// Public route for storefront banners (hero carousel, promo banners)
router.get('/', getBanners);

// Protected Admin-only routes
router.use(protect, authorize('admin'));

router.post('/', uploadSingleImage('image'), validate(createBannerValidator), createBanner);
router.patch('/reorder', validate(reorderBannersValidator), reorderBanners);

router
  .route('/:id')
  .get(getBannerById)
  .patch(uploadSingleImage('image'), validate(updateBannerValidator), updateBanner)
  .delete(deleteBanner);

export default router;
