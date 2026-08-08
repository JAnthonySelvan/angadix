import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCartRemote,
  applyCoupon,
  removeCoupon,
  mergeGuestCart,
} from './cartThunks';

// Guest localStorage helpers
export const loadGuestCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('angadix_guest_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveGuestCartToStorage = (items) => {
  try {
    localStorage.setItem('angadix_guest_cart', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save guest cart:', err);
  }
};

export const clearGuestCartStorage = () => {
  try {
    localStorage.removeItem('angadix_guest_cart');
  } catch (err) {
    console.error('Failed to clear guest cart storage:', err);
  }
};

const initialState = {
  items: [],
  subtotal: 0,
  discountAmount: 0,
  total: 0,
  itemCount: 0,
  appliedCoupon: null,
  isCartOpen: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const updateStateWithCartData = (state, cartData) => {
  if (!cartData) return;
  state.items = cartData.items || [];
  state.subtotal = cartData.subtotal || 0;
  state.discountAmount = cartData.discountAmount || 0;
  state.total = cartData.total || 0;
  state.itemCount = cartData.itemCount || 0;
  state.appliedCoupon = cartData.appliedCoupon || null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartDrawerOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
    clearCartState: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.discountAmount = 0;
      state.total = 0;
      state.itemCount = 0;
      state.appliedCoupon = null;
      state.status = 'idle';
      state.error = null;
    },
    // Guest cart fallback actions
    setGuestCartItems: (state, action) => {
      const items = action.payload || [];
      state.items = items;
      state.itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      state.subtotal = items.reduce((sum, i) => {
        const price = i.product?.discountPrice || i.product?.price || 0;
        return sum + price * (i.quantity || 1);
      }, 0);
      state.total = state.subtotal;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        updateStateWithCartData(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // 2. addItemToCart
    builder
      .addCase(addItemToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        updateStateWithCartData(state, action.payload);
        state.isCartOpen = true; // Auto open drawer on add
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // 3. updateCartItem
    builder
      .addCase(updateCartItem.fulfilled, (state, action) => {
        updateStateWithCartData(state, action.payload);
      });

    // 4. removeCartItem
    builder
      .addCase(removeCartItem.fulfilled, (state, action) => {
        updateStateWithCartData(state, action.payload);
      });

    // 5. clearCartRemote
    builder
      .addCase(clearCartRemote.fulfilled, (state, action) => {
        updateStateWithCartData(state, action.payload);
      });

    // 6. applyCoupon
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        updateStateWithCartData(state, action.payload);
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 7. removeCoupon
    builder
      .addCase(removeCoupon.fulfilled, (state, action) => {
        updateStateWithCartData(state, action.payload);
      });

    // 8. mergeGuestCart
    builder
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        updateStateWithCartData(state, action.payload);
      });
  },
});

export const {
  toggleCartDrawer,
  setCartDrawerOpen,
  clearCartState,
  setGuestCartItems,
} = cartSlice.actions;

// Selectors matching backend response shape
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalCount = (state) => state.cart.itemCount;
export const selectCartTotalPrice = (state) => state.cart.subtotal;
export const selectCartDiscountAmount = (state) => state.cart.discountAmount;
export const selectCartFinalTotal = (state) => state.cart.total;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
export const selectIsCartDrawerOpen = (state) => state.cart.isCartOpen;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
