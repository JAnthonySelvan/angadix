import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

/**
 * Fetch User Addresses
 * GET /api/v1/addresses
 */
export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/addresses');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch addresses.'
      );
    }
  }
);

/**
 * Create New Address
 * POST /api/v1/addresses
 */
export const createAddress = createAsyncThunk(
  'address/createAddress',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create address.'
      );
    }
  }
);

/**
 * Update Existing Address
 * PATCH /api/v1/addresses/:id
 */
export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/addresses/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update address.'
      );
    }
  }
);

/**
 * Delete Address
 * DELETE /api/v1/addresses/:id
 */
export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete address.'
      );
    }
  }
);

/**
 * Set Default Address
 * PATCH /api/v1/addresses/:id/default
 */
export const setDefaultAddress = createAsyncThunk(
  'address/setDefaultAddress',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/addresses/${id}/default`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to set default address.'
      );
    }
  }
);
