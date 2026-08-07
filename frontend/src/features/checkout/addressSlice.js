import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './addressThunks';

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddressState: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchAddresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // 2. createAddress
    builder.addCase(createAddress.fulfilled, (state, action) => {
      const newAddress = action.payload;
      if (newAddress.isDefault) {
        state.items = state.items.map((item) => ({ ...item, isDefault: false }));
      }
      state.items.unshift(newAddress);
    });

    // 3. updateAddress
    builder.addCase(updateAddress.fulfilled, (state, action) => {
      const updatedAddress = action.payload;
      if (updatedAddress.isDefault) {
        state.items = state.items.map((item) =>
          item._id === updatedAddress._id
            ? updatedAddress
            : { ...item, isDefault: false }
        );
      } else {
        state.items = state.items.map((item) =>
          item._id === updatedAddress._id ? updatedAddress : item
        );
      }
    });

    // 4. deleteAddress
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      const deletedId = action.payload;
      state.items = state.items.filter((item) => item._id !== deletedId);
      // If we deleted the default address and remaining addresses exist, update state if first is default
      if (state.items.length > 0 && !state.items.some((item) => item.isDefault)) {
        state.items[0].isDefault = true;
      }
    });

    // 5. setDefaultAddress
    builder.addCase(setDefaultAddress.fulfilled, (state, action) => {
      const defaultId = action.payload._id;
      state.items = state.items.map((item) => ({
        ...item,
        isDefault: item._id === defaultId,
      }));
    });
  },
});

export const { clearAddressState } = addressSlice.actions;

export const selectAddresses = (state) => state.address.items || [];
export const selectDefaultAddress = (state) =>
  state.address.items?.find((a) => a.isDefault) || state.address.items?.[0] || null;
export const selectAddressStatus = (state) => state.address.status;

export default addressSlice.reducer;
