import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  quickUpdateStock,
} from './adminProductsThunks';

const initialState = {
  products: [],
  pagination: {
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  },
  loading: false,
  error: null,
};

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload.items || [];
        const p = action.payload.pagination || {};
        const page = p.page || p.currentPage || 1;
        const total = p.total ?? p.totalProducts ?? p.totalItems ?? 0;
        const totalPages = p.totalPages || Math.ceil(total / (p.limit || 10)) || 1;

        state.pagination = {
          total,
          totalProducts: total,
          totalItems: total,
          page,
          currentPage: page,
          totalPages,
          limit: p.limit || 10,
          hasNextPage: p.hasNextPage ?? (page < totalPages),
          hasPrevPage: p.hasPrevPage ?? (page > 1),
        };
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(quickUpdateStock.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload.id);
        if (index !== -1) {
          state.products[index].stock = action.payload.stock;
        }
      });
  },
});

export default adminProductsSlice.reducer;
