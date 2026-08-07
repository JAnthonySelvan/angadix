import { createSlice } from '@reduxjs/toolkit';
import {
  fetchOverview,
  fetchSalesGraph,
  fetchTopProducts,
  fetchInventoryStatus,
  fetchCustomerInsights,
} from './analyticsThunks';

const initialState = {
  overview: null,
  salesGraph: null,
  topProducts: [],
  inventoryStatus: null,
  customerInsights: null,
  activePeriod: '7d',
  loading: {
    overview: false,
    salesGraph: false,
    topProducts: false,
    inventoryStatus: false,
    customerInsights: false,
  },
  error: null,
};

const analyticsSlice = createSlice({
  name: 'adminAnalytics',
  initialState,
  reducers: {
    setActivePeriod: (state, action) => {
      state.activePeriod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchOverview.pending, (state) => {
        state.loading.overview = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading.overview = false;
        state.error = action.payload;
      })
      // Sales Graph
      .addCase(fetchSalesGraph.pending, (state) => {
        state.loading.salesGraph = true;
      })
      .addCase(fetchSalesGraph.fulfilled, (state, action) => {
        state.loading.salesGraph = false;
        state.salesGraph = action.payload;
      })
      .addCase(fetchSalesGraph.rejected, (state, action) => {
        state.loading.salesGraph = false;
        state.error = action.payload;
      })
      // Top Products
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading.topProducts = true;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading.topProducts = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading.topProducts = false;
        state.error = action.payload;
      })
      // Inventory Status
      .addCase(fetchInventoryStatus.pending, (state) => {
        state.loading.inventoryStatus = true;
      })
      .addCase(fetchInventoryStatus.fulfilled, (state, action) => {
        state.loading.inventoryStatus = false;
        state.inventoryStatus = action.payload;
      })
      .addCase(fetchInventoryStatus.rejected, (state, action) => {
        state.loading.inventoryStatus = false;
        state.error = action.payload;
      })
      // Customer Insights
      .addCase(fetchCustomerInsights.pending, (state) => {
        state.loading.customerInsights = true;
      })
      .addCase(fetchCustomerInsights.fulfilled, (state, action) => {
        state.loading.customerInsights = false;
        state.customerInsights = action.payload;
      })
      .addCase(fetchCustomerInsights.rejected, (state, action) => {
        state.loading.customerInsights = false;
        state.error = action.payload;
      });
  },
});

export const { setActivePeriod } = analyticsSlice.actions;
export default analyticsSlice.reducer;
