import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSavedForLater,
  moveCartItemToSaved,
  moveSavedItemToCart,
  removeSavedItem,
} from './savedForLaterThunks';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const extractSavedItems = (savedData) => {
  if (!savedData) return [];
  // If object returned has .savedForLater, extract .items
  if (savedData.savedForLater) {
    return savedData.savedForLater.items || [];
  }
  return savedData.items || [];
};

const savedForLaterSlice = createSlice({
  name: 'savedForLater',
  initialState,
  reducers: {
    clearSavedForLaterState: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchSavedForLater
    builder
      .addCase(fetchSavedForLater.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSavedForLater.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = extractSavedItems(action.payload);
      })
      .addCase(fetchSavedForLater.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // 2. moveCartItemToSaved
    builder
      .addCase(moveCartItemToSaved.fulfilled, (state, action) => {
        state.items = extractSavedItems(action.payload);
      });

    // 3. moveSavedItemToCart
    builder
      .addCase(moveSavedItemToCart.fulfilled, (state, action) => {
        state.items = extractSavedItems(action.payload);
      });

    // 4. removeSavedItem
    builder
      .addCase(removeSavedItem.fulfilled, (state, action) => {
        state.items = extractSavedItems(action.payload);
      });
  },
});

export const { clearSavedForLaterState } = savedForLaterSlice.actions;

export const selectSavedForLaterItems = (state) => state.savedForLater?.items || [];
export const selectSavedForLaterCount = (state) => (state.savedForLater?.items || []).length;

export default savedForLaterSlice.reducer;
