import { createSlice } from '@reduxjs/toolkit';
import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
  moveWishlistItemToCart,
} from './wishlistThunks';

// Guest localStorage helpers
export const loadGuestWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem('angadix_guest_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveGuestWishlistToStorage = (items) => {
  try {
    localStorage.setItem('angadix_guest_wishlist', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save guest wishlist:', err);
  }
};

const initialState = {
  items: loadGuestWishlistFromStorage(),
  status: 'idle',
  error: null,
};

const extractWishlistItems = (wishlistData) => {
  if (!wishlistData) return [];
  if (Array.isArray(wishlistData)) return wishlistData;
  if (Array.isArray(wishlistData.items)) {
    return wishlistData.items
      .map((item) => {
        if (!item) return null;
        if (item.product && typeof item.product === 'object') {
          return item.product;
        }
        return item.product || item;
      })
      .filter(Boolean);
  }
  return [];
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
    setGuestWishlistItems: (state, action) => {
      state.items = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    // 1. fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = extractWishlistItems(action.payload);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // 2. addWishlistItem
    builder
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.items = extractWishlistItems(action.payload);
      });

    // 3. removeWishlistItem
    builder
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = extractWishlistItems(action.payload);
      });

    // 4. moveWishlistItemToCart
    builder
      .addCase(moveWishlistItemToCart.fulfilled, (state, action) => {
        if (action.payload && action.payload.wishlist) {
          state.items = extractWishlistItems(action.payload.wishlist);
        } else if (action.meta?.arg) {
          const movedProductId = String(action.meta.arg);
          state.items = state.items.filter((item) => {
            const id = item._id || item.id || item.product?._id || item.product;
            return String(id) !== movedProductId;
          });
        }
      });
  },
});

export const { clearWishlistState, setGuestWishlistItems } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items || [];
export const selectIsInWishlist = (productId) => (state) => {
  if (!productId || !state.wishlist?.items) return false;
  const targetId = String(productId);
  return state.wishlist.items.some((item) => {
    if (!item) return false;
    if (typeof item === 'string') return item === targetId;
    const itemId = item._id || item.id || item.product?._id || item.product;
    return String(itemId) === targetId;
  });
};

export default wishlistSlice.reducer;
