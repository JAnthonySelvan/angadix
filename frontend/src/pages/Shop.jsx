import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, RefreshCcw, Star, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchProductsList,
  fetchCategories,
  fetchBrands,
  searchProducts,
  fetchProductFacets,
} from '../features/products/productThunks';
import { ProductCard } from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/ProductSkeleton';
import { QuickViewModal } from '../components/common/QuickViewModal';

const parseParamArray = (paramVal) => {
  if (!paramVal) return [];
  return paramVal.split(',').map((item) => item.trim()).filter(Boolean);
};

export const Shop = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { catalog, search, facets, categories, brands } = useAppSelector(
    (state) => state.products
  );
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Local Filter States initialized from URL params
  const [selectedCategories, setSelectedCategories] = useState(
    parseParamArray(searchParams.get('category'))
  );
  const [selectedBrands, setSelectedBrands] = useState(
    parseParamArray(searchParams.get('brand'))
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(searchParams.get('isFeatured') === 'true');
  const [isWishlistOnly, setIsWishlistOnly] = useState(searchParams.get('wishlist') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Sync state with URL params change
  useEffect(() => {
    setSelectedCategories(parseParamArray(searchParams.get('category')));
    setSelectedBrands(parseParamArray(searchParams.get('brand')));
    setSearchQuery(searchParams.get('search') || '');
    setSortOption(searchParams.get('sort') || 'newest');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinRating(searchParams.get('minRating') || '');
    setInStockOnly(searchParams.get('inStock') === 'true');
    setIsFeaturedOnly(searchParams.get('isFeatured') === 'true');
    setIsWishlistOnly(searchParams.get('wishlist') === 'true');
  }, [searchParams]);

  // Facet count lookup maps
  const facetCategoryCounts = useMemo(() => {
    const map = {};
    if (facets.data?.categories) {
      facets.data.categories.forEach((cat) => {
        if (cat.slug) map[cat.slug] = cat.count;
        if (cat._id) map[cat._id] = cat.count;
      });
    }
    return map;
  }, [facets.data]);

  const facetBrandCounts = useMemo(() => {
    const map = {};
    if (facets.data?.brands) {
      facets.data.brands.forEach((b) => {
        if (b.slug) map[b.slug] = b.count;
        if (b._id) map[b._id] = b.count;
      });
    }
    return map;
  }, [facets.data]);

  // Determine if search query is active alone without other filters
  const isOnlySearchActive = useMemo(() => {
    return (
      Boolean(searchQuery) &&
      selectedCategories.length === 0 &&
      selectedBrands.length === 0 &&
      !minPrice &&
      !maxPrice &&
      !minRating &&
      !inStockOnly &&
      !isFeaturedOnly
    );
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isFeaturedOnly,
  ]);

  // Fetch product catalog or search results & facet counts side-effect
  useEffect(() => {
    if (isWishlistOnly) return;

    const params = {
      page: currentPage,
      limit: 12,
      sort: sortOption,
    };

    if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    if (inStockOnly) params.inStock = 'true';
    if (isFeaturedOnly) params.isFeatured = 'true';

    if (isOnlySearchActive) {
      params.q = searchQuery;
      dispatch(searchProducts(params));
    } else {
      if (searchQuery) params.search = searchQuery;
      dispatch(fetchProductsList(params));
    }

    // Side-effect: fetch facets asynchronously without blocking product grid
    const facetParams = {};
    if (selectedCategories.length > 0) facetParams.category = selectedCategories.join(',');
    if (selectedBrands.length > 0) facetParams.brand = selectedBrands.join(',');
    if (minPrice) facetParams.minPrice = minPrice;
    if (maxPrice) facetParams.maxPrice = maxPrice;
    if (minRating) facetParams.minRating = minRating;
    if (inStockOnly) facetParams.inStock = 'true';
    if (isFeaturedOnly) facetParams.isFeatured = 'true';
    if (searchQuery) facetParams.search = searchQuery;

    dispatch(fetchProductFacets(facetParams));
  }, [
    dispatch,
    selectedCategories,
    selectedBrands,
    searchQuery,
    sortOption,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isFeaturedOnly,
    currentPage,
    isWishlistOnly,
    isOnlySearchActive,
  ]);

  const handleCategoryToggle = (slug) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug];
      updateUrlParams({ category: next.length > 0 ? next.join(',') : null });
      return next;
    });
    setCurrentPage(1);
  };

  const handleBrandToggle = (slug) => {
    setSelectedBrands((prev) => {
      const next = prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug];
      updateUrlParams({ brand: next.length > 0 ? next.join(',') : null });
      return next;
    });
    setCurrentPage(1);
  };

  const updateUrlParams = (updatedObj) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updatedObj).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery('');
    setSortOption('newest');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setIsFeaturedOnly(false);
    setIsWishlistOnly(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  const currentProductState = isWishlistOnly
    ? { products: wishlistItems, loading: false, pagination: { totalPages: 1 } }
    : isOnlySearchActive
    ? search
    : catalog;

  const displayedProducts = currentProductState.products || [];
  const isLoading = currentProductState.loading;
  const pagination = currentProductState.pagination || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-[#BAE6FD] dark:border-slate-800 bg-gradient-to-r from-[#0266C8] via-[#0054A6] to-[#0a2540] dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 transition-all duration-300">
        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading mb-2 tracking-tight">
          {isWishlistOnly
            ? t('wishlist.title', 'My Wishlist Collection')
            : isOnlySearchActive
            ? `${t('common.suggestions', 'Search Results')} "${searchQuery}"`
            : t('shop.title', 'Shop Product Catalog')}
        </h1>
        <p className="text-xs sm:text-sm text-sky-100 dark:text-slate-300 font-body max-w-xl leading-relaxed">
          {isWishlistOnly
            ? t('wishlist.subtitle', 'Your saved items for future purchases')
            : t('shop.subtitle', 'Browse top-quality electronics, smartphones, laptops, and lifestyle items with authentic warranty.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="p-6 bg-white dark:bg-slate-900 border border-[#BAE6FD]/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#BAE6FD]/60 dark:border-slate-800">
              <div className="flex items-center gap-2 font-extrabold font-heading text-sm text-[#0a2540] dark:text-white">
                <SlidersHorizontal size={18} className="text-[#0266C8] dark:text-sky-400" />
                <span>{t('shop.filterTitle', 'Filter Products')}</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-[#0266C8] dark:hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCcw size={12} />
                <span>{t('shop.clearFilters', 'Reset')}</span>
              </button>
            </div>

            {/* In-Stock Filter Toggle */}
            <div className="pb-4 border-b border-[#BAE6FD]/60 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider">
                  {t('shop.inStockOnly', 'In-Stock Only')}
                  {facets.data?.inStock !== undefined && (
                    <span className="text-[10px] font-normal text-slate-400 ml-1">
                      ({facets.data.inStock})
                    </span>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    updateUrlParams({ inStock: e.target.checked ? 'true' : null });
                  }}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8] transition-colors"
                />
              </label>
            </div>

            {/* Categories (Multi-Select) */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider font-heading">
                {t('shop.categoryFilter', 'Categories')}
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {categories.items.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.slug);
                  const count = facetCategoryCounts[cat.slug] ?? facetCategoryCounts[cat._id];
                  return (
                    <label
                      key={cat._id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#E1F5FE] dark:bg-sky-950/60 text-[#0266C8] dark:text-sky-300 font-bold border border-[#BAE6FD]/60 dark:border-sky-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-[#F0F8FF] dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategoryToggle(cat.slug)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8]"
                        />
                        <span>{cat.name}</span>
                      </div>
                      {count !== undefined && (
                        <span className="text-[10px] font-bold text-slate-400">({count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brands (Multi-Select) */}
            <div className="space-y-2 pt-4 border-t border-[#BAE6FD]/60 dark:border-slate-800">
              <h4 className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider font-heading">
                {t('shop.brandFilter', 'Brands')}
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {brands.items.map((b) => {
                  const isChecked = selectedBrands.includes(b.slug);
                  const count = facetBrandCounts[b.slug] ?? facetBrandCounts[b._id];
                  return (
                    <label
                      key={b._id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#E1F5FE] dark:bg-sky-950/60 text-[#0266C8] dark:text-sky-300 font-bold border border-[#BAE6FD]/60 dark:border-sky-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-[#F0F8FF] dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(b.slug)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8]"
                        />
                        <span>{b.name}</span>
                      </div>
                      {count !== undefined && (
                        <span className="text-[10px] font-bold text-slate-400">({count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Customer Rating Filter */}
            <div className="space-y-2 pt-4 border-t border-[#BAE6FD]/60 dark:border-slate-800">
              <h4 className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider font-heading">
                {t('shop.ratingFilter', 'Minimum Rating')}
              </h4>
              <div className="space-y-1">
                {[
                  { label: 'All Ratings', value: '' },
                  { label: '4★ & up', value: '4' },
                  { label: '3★ & up', value: '3' },
                  { label: '2★ & up', value: '2' },
                ].map((ratingOption) => (
                  <label
                    key={ratingOption.value}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      minRating === ratingOption.value
                        ? 'bg-[#E1F5FE] dark:bg-sky-950/60 text-[#0266C8] dark:text-sky-300 font-bold border border-[#BAE6FD]/60 dark:border-sky-800/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-[#F0F8FF] dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === ratingOption.value}
                        onChange={() => {
                          setMinRating(ratingOption.value);
                          updateUrlParams({ minRating: ratingOption.value || null });
                        }}
                        className="w-3.5 h-3.5 text-[#0266C8] focus:ring-[#0266C8]"
                      />
                      <span>{ratingOption.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3 pt-4 border-t border-[#BAE6FD]/60 dark:border-slate-800">
              <h4 className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider font-heading">
                {t('shop.priceRange', 'Price Range')} (₹)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={t('shop.minPrice', 'Min')}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    updateUrlParams({ minPrice: e.target.value || null });
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-[#F0F8FF] dark:bg-slate-800 border border-[#BAE6FD] dark:border-slate-700 rounded-lg text-[#0a2540] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0266C8]"
                />
                <input
                  type="number"
                  placeholder={t('shop.maxPrice', 'Max')}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    updateUrlParams({ maxPrice: e.target.value || null });
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-[#F0F8FF] dark:bg-slate-800 border border-[#BAE6FD] dark:border-slate-700 rounded-lg text-[#0a2540] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0266C8]"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Grid */}
        <main className="space-y-6 lg:col-span-3">
          {/* Top Sort & Search Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-[#BAE6FD]/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {t('shop.showingResults', { count: displayedProducts.length })}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{t('shop.sortBy', 'Sort By:')}</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                className="px-3.5 py-2 text-xs font-bold bg-[#F0F8FF] dark:bg-slate-800 text-[#0a2540] dark:text-slate-100 rounded-xl border border-[#BAE6FD] dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0266C8]"
              >
                <option value="newest">{t('shop.sortNewest', 'Newest Arrivals')}</option>
                <option value="price_asc">{t('shop.sortPriceLowHigh', 'Price: Low to High')}</option>
                <option value="price_desc">{t('shop.sortPriceHighLow', 'Price: High to Low')}</option>
                <option value="rating">{t('shop.sortRating', 'Top Customer Rating')}</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {isLoading ? (
              <ProductSkeleton count={6} />
            ) : displayedProducts.length > 0 ? (
              displayedProducts.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500 text-sm">
                {t('shop.noProductsFound', 'No products found matching your active filters.')}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isWishlistOnly && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => {
                  const prevPage = Math.max(1, currentPage - 1);
                  setCurrentPage(prevPage);
                  updateUrlParams({ page: prevPage > 1 ? prevPage : null });
                }}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-[#BAE6FD] dark:border-slate-800 rounded-xl text-xs font-bold text-[#0a2540] dark:text-slate-300 hover:bg-[#E1F5FE] dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                Page {pagination.page || currentPage} of {pagination.totalPages}
              </span>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  updateUrlParams({ page: nextPage });
                }}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-[#BAE6FD] dark:border-slate-800 rounded-xl text-xs font-bold text-[#0a2540] dark:text-slate-300 hover:bg-[#E1F5FE] dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
