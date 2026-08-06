import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  addToCartValidator,
  updateCartItemValidator,
  removeFromCartValidator,
  applyCouponValidator,
  mergeCartValidator,
} from '../validators/cart.validator.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart,
} from '../controllers/cart.controller.js';

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/items', validate(addToCartValidator), addToCart);
router.patch('/items/:productId', validate(updateCartItemValidator), updateCartItem);
router.delete('/items/:productId', validate(removeFromCartValidator), removeFromCart);
router.delete('/', clearCart);

router.post('/apply-coupon', validate(applyCouponValidator), applyCoupon);
router.delete('/coupon', removeCoupon);

router.post('/merge', validate(mergeCartValidator), mergeCart);

export default router;
