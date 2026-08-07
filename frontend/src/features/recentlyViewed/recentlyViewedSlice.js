import { createSlice } from '@reduxjs/toolkit';

export const loadRecentlyViewedFromStorage = () => {
  try {
    const saved = localStorage.getItem('angadix_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveRecentlyViewedToStorage = (items) => {
  try {
    localStorage.setItem('angadix_recently_viewed', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save recently viewed items:', err);
  }
};

const initialState = {
  items: loadRecentlyViewedFromStorage(),
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    trackProductView: (state, action) => {
      const product = action.payload;
      if (!product || !product._id) return;

      const filtered = state.items.filter(
        (p) => String(p._id || p.id || p) !== String(product._id)
      );
      const updated = [product, ...filtered].slice(0, 10);
      state.items = updated;
      saveRecentlyViewedToStorage(updated);
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
      try {
        localStorage.removeItem('angadix_recently_viewed');
      } catch (err) {
        console.error('Failed to clear recently viewed storage:', err);
      }
    },
  },
});

export const { trackProductView, clearRecentlyViewed } = recentlyViewedSlice.actions;

export const selectRecentlyViewedItems = (state) => state.recentlyViewed?.items || [];

export default recentlyViewedSlice.reducer;
