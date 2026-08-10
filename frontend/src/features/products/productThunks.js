import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

/**
 * Fetch Homepage Aggregated Product Sections (Trending, Flash Sale, Featured, Best Sellers, Top Rated, Recently Added)
 */
export const fetchHomepageProducts = createAsyncThunk(
  'products/fetchHomepageProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/homepage');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch homepage products'
      );
    }
  }
);

/**
 * Fetch All Categories
 */
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories?isActive=true');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

/**
 * Fetch All Brands
 */
export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/brands?isActive=true');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch brands'
      );
    }
  }
);

/**
 * Fetch Paginated / Filtered Products List
 */
export const fetchProductsList = createAsyncThunk(
  'products/fetchProductsList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products list'
      );
    }
  }
);

/**
 * Fetch Single Product By Slug
 */
export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product details'
      );
    }
  }
);

/**
 * Full-Text Search Products (Relevance Ranked)
 */
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/search', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search products'
      );
    }
  }
);

/**
 * Fetch Live Search Suggestions / Autocomplete
 */
export const fetchSearchSuggestions = createAsyncThunk(
  'products/fetchSearchSuggestions',
  async (q, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/search/suggestions', { params: { q } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch search suggestions'
      );
    }
  }
);

/**
 * Fetch Faceted Counts For Active Filters
 */
export const fetchProductFacets = createAsyncThunk(
  'products/fetchProductFacets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/facets', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product facets'
      );
    }
  }
);

/**
 * Fetch Frequently Bought Together Products
 */
export const fetchFrequentlyBoughtTogether = createAsyncThunk(
  'products/fetchFrequentlyBoughtTogether',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}/frequently-bought-together`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch frequently bought together products'
      );
    }
  }
);

/**
 * Fetch Personalized "Recommended For You" Products
 */
export const fetchRecommendedForYou = createAsyncThunk(
  'products/fetchRecommendedForYou',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/recommendations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recommendations'
      );
    }
  }
);

/**
 * Fetch Active Featured Showcase Items for Home Page
 */
export const fetchFeaturedShowcase = createAsyncThunk(
  'products/fetchFeaturedShowcase',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/featured-showcase?isActive=true');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured showcase items'
      );
    }
  }
);


