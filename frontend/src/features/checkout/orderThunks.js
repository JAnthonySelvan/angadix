import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

/**
 * Create Order
 * POST /api/v1/orders
 * Payload: { shippingAddressId, paymentMethod }
 */
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async ({ shippingAddressId, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', {
        shippingAddressId,
        paymentMethod,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order.'
      );
    }
  }
);

/**
 * Verify Razorpay Payment Signature
 * POST /api/v1/orders/verify-payment
 * Payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 */
export const verifyPayment = createAsyncThunk(
  'order/verifyPayment',
  async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/orders/verify-payment', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Payment verification failed.'
      );
    }
  }
);

/**
 * Fetch My Orders
 * GET /api/v1/orders/my-orders
 */
export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/my-orders', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order history.'
      );
    }
  }
);

/**
 * Fetch Single Order by ID
 * GET /api/v1/orders/:id
 */
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order details.'
      );
    }
  }
);

/**
 * Cancel Order
 * PATCH /api/v1/orders/:id/cancel
 * Payload: { id, reason }
 */
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel order.'
      );
    }
  }
);
