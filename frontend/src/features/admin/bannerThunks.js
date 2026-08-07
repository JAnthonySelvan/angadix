import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchAdminBanners = createAsyncThunk(
  'adminBanners/fetchAdminBanners',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/banners', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch banners'
      );
    }
  }
);

export const createAdminBanner = createAsyncThunk(
  'adminBanners/createAdminBanner',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create banner'
      );
    }
  }
);

export const updateAdminBanner = createAsyncThunk(
  'adminBanners/updateAdminBanner',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update banner'
      );
    }
  }
);

export const deleteAdminBanner = createAsyncThunk(
  'adminBanners/deleteAdminBanner',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete banner'
      );
    }
  }
);
