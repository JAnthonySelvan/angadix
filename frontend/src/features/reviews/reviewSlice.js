import { createSlice } from '@reduxjs/toolkit';
import {
  fetchProductReviews,
  fetchReviewSummary,
  createProductReview,
  deleteProductReview,
} from './reviewThunks';

const initialState = {
  reviews: [],
  summary: {
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  },
  pagination: {
    page: 1,
    limit: 6,
    totalCount: 0,
    totalPages: 1,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.summary = { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Summary
      .addCase(fetchReviewSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      // Create Review
      .addCase(createProductReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.reviews.unshift(action.payload);
        state.summary.count += 1;
        if (action.payload.rating) {
          state.summary.distribution[action.payload.rating] =
            (state.summary.distribution[action.payload.rating] || 0) + 1;
        }
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      // Delete Review
      .addCase(deleteProductReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearReviews } = reviewSlice.actions;

export const selectReviews = (state) => state.reviews.reviews;
export const selectReviewSummary = (state) => state.reviews.summary;
export const selectReviewPagination = (state) => state.reviews.pagination;
export const selectIsReviewLoading = (state) => state.reviews.isLoading;
export const selectIsReviewSubmitting = (state) => state.reviews.isSubmitting;

export default reviewSlice.reducer;
