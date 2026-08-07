import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchAdminProducts = createAsyncThunk(
  'adminProducts/fetchAdminProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin product catalog'
      );
    }
  }
);

export const createAdminProduct = createAsyncThunk(
  'adminProducts/createAdminProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product'
      );
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  'adminProducts/updateAdminProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product'
      );
    }
  }
);

export const deleteAdminProduct = createAsyncThunk(
  'adminProducts/deleteAdminProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete product'
      );
    }
  }
);

export const quickUpdateStock = createAsyncThunk(
  'adminProducts/quickUpdateStock',
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stock });
      return { id, stock: response.data.data.stock };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update stock'
      );
    }
  }
);
