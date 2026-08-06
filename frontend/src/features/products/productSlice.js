import { createSlice } from '@reduxjs/toolkit';
import {
  fetchHomepageProducts,
  fetchCategories,
  fetchBrands,
  fetchProductsList,
  fetchProductBySlug,
} from './productThunks';

const initialState = {
  homepage: {
    trending: [],
    flashSale: [],
    featured: [],
    bestSellers: [],
    topRated: [],
    recentlyAdded: [],
    loading: false,
    error: null,
  },
  categories: {
    items: [],
    loading: false,
    error: null,
  },
  brands: {
    items: [],
    loading: false,
    error: null,
  },
  catalog: {
    products: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    loading: false,
    error: null,
  },
  selectedProduct: {
    data: null,
    loading: false,
    error: null,
  },
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Homepage aggregated products
    builder
      .addCase(fetchHomepageProducts.pending, (state) => {
        state.homepage.loading = true;
        state.homepage.error = null;
      })
      .addCase(fetchHomepageProducts.fulfilled, (state, action) => {
        state.homepage.loading = false;
        state.homepage.trending = action.payload.trending || [];
        state.homepage.flashSale = action.payload.flashSale || [];
        state.homepage.featured = action.payload.featured || [];
        state.homepage.bestSellers = action.payload.bestSellers || [];
        state.homepage.topRated = action.payload.topRated || [];
        state.homepage.recentlyAdded = action.payload.recentlyAdded || [];
      })
      .addCase(fetchHomepageProducts.rejected, (state, action) => {
        state.homepage.loading = false;
        state.homepage.error = action.payload;
      });

    // Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.items = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      });

    // Brands
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.brands.loading = true;
        state.brands.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands.loading = false;
        state.brands.items = action.payload || [];
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.brands.loading = false;
        state.brands.error = action.payload;
      });

    // Catalog list
    builder
      .addCase(fetchProductsList.pending, (state) => {
        state.catalog.loading = true;
        state.catalog.error = null;
      })
      .addCase(fetchProductsList.fulfilled, (state, action) => {
        state.catalog.loading = false;
        state.catalog.products = action.payload.products || [];
        state.catalog.pagination = action.payload.pagination || state.catalog.pagination;
      })
      .addCase(fetchProductsList.rejected, (state, action) => {
        state.catalog.loading = false;
        state.catalog.error = action.payload;
      });

    // Single Product Detail
    builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.selectedProduct.loading = true;
        state.selectedProduct.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.selectedProduct.loading = false;
        state.selectedProduct.data = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.selectedProduct.loading = false;
        state.selectedProduct.error = action.payload;
      });
  },
});

export const { setSearchQuery, clearSearch } = productSlice.actions;
export default productSlice.reducer;
