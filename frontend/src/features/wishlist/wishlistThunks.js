import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

/**
 * Fetch Wishlist
 * GET /api/v1/wishlist
 */
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist.'
      );
    }
  }
);

/**
 * Add Item to Wishlist
 * POST /api/v1/wishlist/items
 */
export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post('/wishlist/items', { productId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to wishlist.'
      );
    }
  }
);

/**
 * Remove Item from Wishlist
 * DELETE /api/v1/wishlist/items/:productId
 */
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/wishlist/items/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from wishlist.'
      );
    }
  }
);

/**
 * Move Wishlist Item to Cart
 * POST /api/v1/wishlist/items/:productId/move-to-cart
 */
export const moveWishlistItemToCart = createAsyncThunk(
  'wishlist/moveWishlistItemToCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/wishlist/items/${productId}/move-to-cart`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move item to cart.'
      );
    }
  }
);
