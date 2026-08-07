import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchOverview = createAsyncThunk(
  'adminAnalytics/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/analytics/overview');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch overview analytics'
      );
    }
  }
);

export const fetchSalesGraph = createAsyncThunk(
  'adminAnalytics/fetchSalesGraph',
  async (period = '7d', { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/analytics/sales-graph?period=${period}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch sales graph analytics'
      );
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'adminAnalytics/fetchTopProducts',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/analytics/top-products?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch top products analytics'
      );
    }
  }
);

export const fetchInventoryStatus = createAsyncThunk(
  'adminAnalytics/fetchInventoryStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/analytics/inventory-status');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch inventory status analytics'
      );
    }
  }
);

export const fetchCustomerInsights = createAsyncThunk(
  'adminAnalytics/fetchCustomerInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/analytics/customer-insights');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customer insights analytics'
      );
    }
  }
);
