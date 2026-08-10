import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchAdminFeaturedShowcase = createAsyncThunk(
  'adminFeaturedShowcase/fetchAdminFeaturedShowcase',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/featured-showcase', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured showcase entries'
      );
    }
  }
);

export const createAdminFeaturedShowcase = createAsyncThunk(
  'adminFeaturedShowcase/createAdminFeaturedShowcase',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/featured-showcase', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create featured showcase entry'
      );
    }
  }
);

export const updateAdminFeaturedShowcase = createAsyncThunk(
  'adminFeaturedShowcase/updateAdminFeaturedShowcase',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/featured-showcase/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update featured showcase entry'
      );
    }
  }
);

export const deleteAdminFeaturedShowcase = createAsyncThunk(
  'adminFeaturedShowcase/deleteAdminFeaturedShowcase',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/featured-showcase/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete featured showcase entry'
      );
    }
  }
);
