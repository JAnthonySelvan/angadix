import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  moveToSavedForLaterValidator,
  moveSavedToCartValidator,
  removeFromSavedForLaterValidator,
} from '../validators/savedForLater.validator.js';
import {
  getSavedForLater,
  moveToSavedForLater,
  moveSavedToCart,
  removeFromSavedForLater,
} from '../controllers/savedForLater.controller.js';

const router = Router();

// All saved for later routes require authentication
router.use(protect);

router.get('/', getSavedForLater);
router.post('/items/:productId', validate(moveToSavedForLaterValidator), moveToSavedForLater);
router.post('/items/:productId/move-to-cart', validate(moveSavedToCartValidator), moveSavedToCart);
router.delete('/items/:productId', validate(removeFromSavedForLaterValidator), removeFromSavedForLater);

export default router;
