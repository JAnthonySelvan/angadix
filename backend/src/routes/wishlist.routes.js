import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  addToWishlistValidator,
  removeFromWishlistValidator,
  moveToCartValidator,
} from '../validators/wishlist.validator.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} from '../controllers/wishlist.controller.js';

const router = Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/items', validate(addToWishlistValidator), addToWishlist);
router.delete('/items/:productId', validate(removeFromWishlistValidator), removeFromWishlist);
router.post('/items/:productId/move-to-cart', validate(moveToCartValidator), moveWishlistToCart);

export default router;
