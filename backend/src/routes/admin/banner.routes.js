import { Router } from 'express';
import { uploadSingleImage } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createBannerValidator,
  updateBannerValidator,
  mongoIdParamValidator,
} from '../../validators/admin.validator.js';
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../controllers/admin/banner.controller.js';

const router = Router();

router
  .route('/')
  .get(getBanners)
  .post(uploadSingleImage('image'), validate(createBannerValidator), createBanner);

router
  .route('/:id')
  .get(validate(mongoIdParamValidator), getBannerById)
  .patch(uploadSingleImage('image'), validate(updateBannerValidator), updateBanner)
  .delete(validate(mongoIdParamValidator), deleteBanner);

export default router;
