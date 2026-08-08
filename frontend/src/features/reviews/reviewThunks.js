import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 1, sort = 'newest' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page, sort, limit: 6 },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reviews'
      );
    }
  }
);

export const fetchReviewSummary = createAsyncThunk(
  'reviews/fetchReviewSummary',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/summary`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch review summary'
      );
    }
  }
);

export const createProductReview = createAsyncThunk(
  'reviews/createProductReview',
  async ({ productId, rating, title, comment, images }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/product/${productId}`, {
        rating,
        title,
        comment,
        images,
      });
      return response.data.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit review'
      );
    }
  }
);

export const deleteProductReview = createAsyncThunk(
  'reviews/deleteProductReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete review'
      );
    }
  }
);
