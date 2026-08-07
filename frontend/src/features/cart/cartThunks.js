import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

/**
 * Fetch Current User's Remote Cart
 * GET /api/v1/cart
 */
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart.'
      );
    }
  }
);

/**
 * Add Item to Remote Cart
 * POST /api/v1/cart/items
 */
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to cart.'
      );
    }
  }
);

/**
 * Update Cart Item Quantity
 * PATCH /api/v1/cart/items/:productId
 */
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/cart/items/${productId}`, { quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update cart item quantity.'
      );
    }
  }
);

/**
 * Remove Item from Remote Cart
 * DELETE /api/v1/cart/items/:productId
 */
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/items/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from cart.'
      );
    }
  }
);

/**
 * Clear Entire Remote Cart
 * DELETE /api/v1/cart
 */
export const clearCartRemote = createAsyncThunk(
  'cart/clearCartRemote',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear cart.'
      );
    }
  }
);

/**
 * Apply Coupon to Remote Cart
 * POST /api/v1/cart/apply-coupon
 */
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/apply-coupon', { code });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to apply coupon.'
      );
    }
  }
);

/**
 * Remove Coupon from Remote Cart
 * DELETE /api/v1/cart/coupon
 */
export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart/coupon');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove coupon.'
      );
    }
  }
);

/**
 * Merge Guest Cart into DB Cart on Login
 * POST /api/v1/cart/merge
 */
export const mergeGuestCart = createAsyncThunk(
  'cart/mergeGuestCart',
  async (items, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/merge', { items });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to merge guest cart.'
      );
    }
  }
);
