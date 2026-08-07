import { createSlice } from '@reduxjs/toolkit';
import {
  createOrder,
  verifyPayment,
  fetchMyOrders,
  fetchOrderById,
  cancelOrder,
} from './orderThunks';

const initialState = {
  currentOrder: null,
  razorpayOrder: null,
  myOrders: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    loading: false,
    error: null,
  },
  selectedOrder: {
    data: null,
    loading: false,
    error: null,
  },
  checkoutStatus: 'idle', // 'idle' | 'creating' | 'awaiting_payment' | 'verifying' | 'success' | 'failed'
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.currentOrder = null;
      state.razorpayOrder = null;
      state.checkoutStatus = 'idle';
      state.error = null;
    },
    setCheckoutStatus: (state, action) => {
      state.checkoutStatus = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = { data: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // 1. createOrder
    builder
      .addCase(createOrder.pending, (state) => {
        state.checkoutStatus = 'creating';
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload?.razorpayOrder) {
          state.currentOrder = payload.order;
          state.razorpayOrder = payload.razorpayOrder;
          state.checkoutStatus = 'awaiting_payment';
        } else {
          // COD or pre-confirmed
          state.currentOrder = payload;
          state.razorpayOrder = null;
          state.checkoutStatus = 'success';
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.checkoutStatus = 'failed';
        state.error = action.payload;
      });

    // 2. verifyPayment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.checkoutStatus = 'verifying';
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.checkoutStatus = 'success';
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.checkoutStatus = 'failed';
        state.error = action.payload;
      });

    // 3. fetchMyOrders
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrders.loading = true;
        state.myOrders.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders.loading = false;
        state.myOrders.items = action.payload.orders || [];
        state.myOrders.pagination = action.payload.pagination || initialState.myOrders.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.myOrders.loading = false;
        state.myOrders.error = action.payload;
      });

    // 4. fetchOrderById
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.selectedOrder.loading = true;
        state.selectedOrder.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder.loading = false;
        state.selectedOrder.data = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.selectedOrder.loading = false;
        state.selectedOrder.error = action.payload;
      });

    // 5. cancelOrder
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      const updatedOrder = action.payload;
      if (state.selectedOrder.data?._id === updatedOrder._id) {
        state.selectedOrder.data = updatedOrder;
      }
      state.myOrders.items = state.myOrders.items.map((ord) =>
        ord._id === updatedOrder._id ? updatedOrder : ord
      );
    });
  },
});

export const { resetCheckout, setCheckoutStatus, clearSelectedOrder } =
  orderSlice.actions;

export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectRazorpayOrder = (state) => state.order.razorpayOrder;
export const selectCheckoutStatus = (state) => state.order.checkoutStatus;
export const selectMyOrders = (state) => state.order.myOrders;
export const selectSelectedOrder = (state) => state.order.selectedOrder;

export default orderSlice.reducer;
