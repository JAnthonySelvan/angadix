import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
} from './bannerThunks';

const initialState = {
  banners: [],
  loading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: 'adminBanners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchAdminBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdminBanner.fulfilled, (state, action) => {
        state.banners.unshift(action.payload);
      })
      .addCase(updateAdminBanner.fulfilled, (state, action) => {
        const index = state.banners.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
      })
      .addCase(deleteAdminBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter((b) => b._id !== action.payload);
      });
  },
});

export default bannerSlice.reducer;
