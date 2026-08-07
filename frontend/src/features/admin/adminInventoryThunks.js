import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchAdminInventory = createAsyncThunk(
  'adminInventory/fetchAdminInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/inventory', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch inventory'
      );
    }
  }
);

export const bulkUpdateAdminStock = createAsyncThunk(
  'adminInventory/bulkUpdateAdminStock',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await api.patch('/admin/inventory/bulk-update', { updates });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to bulk update stock'
      );
    }
  }
);
