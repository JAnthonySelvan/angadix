import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAdminFeaturedShowcase,
  createAdminFeaturedShowcase,
  updateAdminFeaturedShowcase,
  deleteAdminFeaturedShowcase,
} from './featuredShowcaseThunks';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const featuredShowcaseSlice = createSlice({
  name: 'adminFeaturedShowcase',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminFeaturedShowcase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminFeaturedShowcase.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminFeaturedShowcase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdminFeaturedShowcase.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateAdminFeaturedShowcase.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAdminFeaturedShowcase.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default featuredShowcaseSlice.reducer;
