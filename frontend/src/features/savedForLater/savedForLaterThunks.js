import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

/**
 * Fetch Saved For Later Items
 * GET /api/v1/saved-for-later
 */
export const fetchSavedForLater = createAsyncThunk(
  'savedForLater/fetchSavedForLater',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/saved-for-later');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch saved for later items.'
      );
    }
  }
);

/**
 * Move Item from Cart to Saved for Later
 * POST /api/v1/saved-for-later/items/:productId
 */
export const moveCartItemToSaved = createAsyncThunk(
  'savedForLater/moveCartItemToSaved',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/saved-for-later/items/${productId}`);
      return response.data.data; // returns { savedForLater, cart }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move item to saved for later.'
      );
    }
  }
);

/**
 * Move Item from Saved for Later back to Cart
 * POST /api/v1/saved-for-later/items/:productId/move-to-cart
 */
export const moveSavedItemToCart = createAsyncThunk(
  'savedForLater/moveSavedItemToCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/saved-for-later/items/${productId}/move-to-cart`);
      return response.data.data; // returns { cart, savedForLater }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move item back to cart.'
      );
    }
  }
);

/**
 * Remove Item from Saved for Later permanently
 * DELETE /api/v1/saved-for-later/items/:productId
 */
export const removeSavedItem = createAsyncThunk(
  'savedForLater/removeSavedItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/saved-for-later/items/${productId}`);
      return response.data.data; // returns updated savedForLater doc
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from saved for later.'
      );
    }
  }
);
