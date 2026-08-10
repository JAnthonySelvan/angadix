import { Router } from 'express';
import { uploadSingleImage } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { mongoIdParamValidator } from '../../validators/admin.validator.js';
import {
  createFeaturedShowcaseValidator,
  updateFeaturedShowcaseValidator,
  reorderFeaturedShowcaseValidator,
} from '../../validators/featuredShowcase.validator.js';
import {
  getFeaturedShowcases,
  getFeaturedShowcaseById,
  createFeaturedShowcase,
  updateFeaturedShowcase,
  deleteFeaturedShowcase,
  reorderFeaturedShowcases,
} from '../../controllers/admin/featuredShowcase.controller.js';

const router = Router();

router.patch('/reorder', validate(reorderFeaturedShowcaseValidator), reorderFeaturedShowcases);

router
  .route('/')
  .get(getFeaturedShowcases)
  .post(uploadSingleImage('image'), validate(createFeaturedShowcaseValidator), createFeaturedShowcase);

router
  .route('/:id')
  .get(validate(mongoIdParamValidator), getFeaturedShowcaseById)
  .patch(uploadSingleImage('image'), validate(updateFeaturedShowcaseValidator), updateFeaturedShowcase)
  .delete(validate(mongoIdParamValidator), deleteFeaturedShowcase);

export default router;
