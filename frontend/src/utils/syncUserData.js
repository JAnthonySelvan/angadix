import { mergeGuestCart, fetchCart } from '../features/cart/cartThunks';
import {
  loadGuestCartFromStorage,
  clearGuestCartStorage,
} from '../features/cart/cartSlice';
import { fetchWishlist } from '../features/wishlist/wishlistThunks';
import { fetchSavedForLater } from '../features/savedForLater/savedForLaterThunks';

/**
 * Helper to sync user cart, wishlist, and saved for later data on initial session hydration or login.
 * If guest cart items exist in localStorage, dispatches POST /api/v1/cart/merge before clearing storage.
 */
export const syncUserData = async (dispatch) => {
  try {
    const guestCart = loadGuestCartFromStorage();
    if (Array.isArray(guestCart) && guestCart.length > 0) {
      const itemsToMerge = guestCart.map((i) => ({
        productId: i.product?._id || i.product || i.productId,
        quantity: i.quantity || 1,
      }));

      await dispatch(mergeGuestCart(itemsToMerge)).unwrap();
      clearGuestCartStorage();
    }
  } catch (err) {
    console.error('Error merging guest cart on login:', err);
  } finally {
    // Sync DB state for Cart, Wishlist, and Saved for Later
    dispatch(fetchCart());
    dispatch(fetchWishlist());
    dispatch(fetchSavedForLater());
  }
};
