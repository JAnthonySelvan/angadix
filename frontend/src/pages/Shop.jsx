import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProductsList, fetchCategories, fetchBrands } from '../features/products/productThunks';
import { ProductCard } from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/ProductSkeleton';
import { QuickViewModal } from '../components/common/QuickViewModal';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { catalog, categories, brands } = useAppSelector((state) => state.products);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Local Filter States initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(searchParams.get('isFeatured') === 'true');
  const [isWishlistOnly, setIsWishlistOnly] = useState(searchParams.get('wishlist') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Sync state with URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setSearchQuery(searchParams.get('search') || '');
    setSortOption(searchParams.get('sort') || 'newest');
    setIsWishlistOnly(searchParams.get('wishlist') === 'true');
  }, [searchParams]);

  // Fetch product catalog when filter state changes
  useEffect(() => {
    if (isWishlistOnly) return; // Wishlist handled client side

    const params = {
      page: currentPage,
      limit: 12,
      sort: sortOption,
    };

    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (searchQuery) params.search = searchQuery;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (isFeaturedOnly) params.isFeatured = 'true';

    dispatch(fetchProductsList(params));
  }, [
    dispatch,
    selectedCategory,
    selectedBrand,
    searchQuery,
    sortOption,
    minPrice,
    maxPrice,
    isFeaturedOnly,
    currentPage,
    isWishlistOnly,
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setSortOption('newest');
    setMinPrice('');
    setMaxPrice('');
    setIsFeaturedOnly(false);
    setIsWishlistOnly(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  const displayedProducts = isWishlistOnly ? wishlistItems : catalog.products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="neu-card bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <h1 className="text-2xl sm:text-4xl font-black mb-2">
          {isWishlistOnly ? 'My Wishlist Collection' : 'Shop Product Catalog'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl">
          {isWishlistOnly
            ? 'Your saved items for future purchases'
            : 'Browse top-quality electronics, smartphones, laptops, and lifestyle items with authentic warranty.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <SlidersHorizontal size={18} className="text-primary-600" />
                <span>Filter Products</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-primary-600 flex items-center gap-1 transition-colors"
              >
                <RefreshCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Categories
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === ''
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.items.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Brands
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedBrand === ''
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Brands
                </button>
                {brands.items.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedBrand === b.slug
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Price Range (₹)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Grid */}
        <main className="space-y-6 lg:col-span-3">
          {/* Top Sort & Search Toolbar */}
          <div className="neu-card p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white">{displayedProducts.length}</span> items
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {catalog.loading ? (
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
                No products found matching your active filters. Try clearing some criteria.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isWishlistOnly && catalog.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={!catalog.pagination.hasPrevPage}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                Page {catalog.pagination.page} of {catalog.pagination.totalPages}
              </span>

              <button
                disabled={!catalog.pagination.hasNextPage}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40"
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
