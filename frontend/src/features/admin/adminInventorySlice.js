import { createSlice } from '@reduxjs/toolkit';
import { fetchAdminInventory, bulkUpdateAdminStock } from './adminInventoryThunks';

const initialState = {
  products: [],
  counts: {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    total: 0,
  },
  pagination: {
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  },
  loading: false,
  error: null,
};

const adminInventorySlice = createSlice({
  name: 'adminInventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.counts = action.payload.counts || state.counts;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAdminInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminInventorySlice.reducer;
