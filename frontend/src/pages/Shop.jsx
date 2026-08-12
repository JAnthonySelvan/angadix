import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  RefreshCcw,
  Star,
  Check,
  ChevronDown,
  X,
  PackageSearch,
  Sparkles,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Breadcrumb } from '../components/common/Breadcrumb';
import { PageTransition } from '../components/common/PageTransition';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { MobileFilterDrawer } from '../components/shop/MobileFilterDrawer';

const parseParamArray = (paramVal) => {
  if (!paramVal) return [];
  return paramVal.split(',').map((item) => item.trim()).filter(Boolean);
};

// Framer Motion staggered variants for product grid
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const Shop = () => {
  useDocumentTitle('Shop All Products');
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { catalog, search, facets, categories, brands } = useAppSelector(
    (state) => state.products
  );
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  // State for expanded parent category sections
  const [expandedParents, setExpandedParents] = useState({});

  // Group categories into parent categories and subcategories
  const { parentCategories, subCategoriesMap } = useMemo(() => {
    const items = categories.items || [];
    const getParentId = (cat) => {
      if (!cat || !cat.parentCategory) return null;
      if (typeof cat.parentCategory === 'object') {
        return cat.parentCategory._id ? String(cat.parentCategory._id) : cat.parentCategory.slug || null;
      }
      return String(cat.parentCategory);
    };

    const parents = [];
    const parentIdSet = new Set();

    items.forEach((cat) => {
      const pId = getParentId(cat);
      if (!pId) {
        parents.push(cat);
        parentIdSet.add(String(cat._id));
        if (cat.slug) parentIdSet.add(cat.slug);
      }
    });

    const subsMap = {};

    items.forEach((cat) => {
      const pId = getParentId(cat);
      if (pId) {
        const parentMatch = items.find(
          (p) => String(p._id) === pId || p.slug === pId
        );
        const parentKey = parentMatch ? String(parentMatch._id) : pId;
        if (!subsMap[parentKey]) subsMap[parentKey] = [];
        subsMap[parentKey].push(cat);
      }
    });

    const knownSubIds = new Set(Object.values(subsMap).flat().map((c) => String(c._id)));
    const topLevelParents = items.filter((cat) => !knownSubIds.has(String(cat._id)));

    return { parentCategories: topLevelParents, subCategoriesMap: subsMap };
  }, [categories.items]);

  // Auto-expand parent categories when parent or child is selected
  useEffect(() => {
    if (selectedCategories.length > 0 && parentCategories.length > 0) {
      setExpandedParents((prev) => {
        const next = { ...prev };
        let changed = false;

        parentCategories.forEach((parent) => {
          const parentKey = String(parent._id);
          const subCats = subCategoriesMap[parentKey] || [];
          const isParentSelected = selectedCategories.includes(parent.slug);
          const isChildSelected = subCats.some((sub) => selectedCategories.includes(sub.slug));

          if ((isParentSelected || isChildSelected) && !next[parentKey]) {
            next[parentKey] = true;
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }
  }, [selectedCategories, parentCategories, subCategoriesMap]);

  const toggleParentExpand = (parentKey, e) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [parentKey]: !prev[parentKey],
    }));
  };

  const getCategoryCount = (cat, subCats = []) => {
    let directCount = facetCategoryCounts[cat.slug] ?? facetCategoryCounts[cat._id] ?? 0;
    if (subCats && subCats.length > 0) {
      let subTotal = 0;
      subCats.forEach((sub) => {
        subTotal += facetCategoryCounts[sub.slug] ?? facetCategoryCounts[sub._id] ?? 0;
      });
      return directCount + subTotal;
    }
    return directCount;
  };

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
      updateUrlParams({
        category: next.length > 0 ? next.join(',') : null,
        search: null,
      });
      return next;
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBrandToggle = (slug) => {
    setSelectedBrands((prev) => {
      const next = prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug];
      updateUrlParams({
        brand: next.length > 0 ? next.join(',') : null,
        search: null,
      });
      return next;
    });
    setSearchQuery('');
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

  // Active filter count for badges
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (searchQuery) count += 1;
    if (minPrice || maxPrice) count += 1;
    if (minRating) count += 1;
    if (inStockOnly) count += 1;
    if (isFeaturedOnly) count += 1;
    return count;
  }, [
    selectedCategories,
    selectedBrands,
    searchQuery,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isFeaturedOnly,
  ]);

  // Render Sidebar & Drawer Controls (shared component logic)
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Reset Filter Button Header (For Desktop view card) */}
      <div className="hidden lg:flex items-center justify-between pb-4 border-b border-[#BAE6FD]/60 dark:border-slate-800">
        <div className="flex items-center gap-2 font-extrabold font-heading text-sm text-[#0a2540] dark:text-white group">
          <SlidersHorizontal size={18} className="text-[#0266C8] dark:text-sky-400 group-hover:scale-110 transition-transform duration-200" />
          <span>{t('shop.filterTitle', 'Filter Products')}</span>
        </div>
        <button
          type="button"
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
          <span className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider group-hover:text-[#0266C8] dark:group-hover:text-sky-400 transition-colors">
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
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8] transition-colors cursor-pointer"
          />
        </label>
      </div>

      {/* Categories (Hierarchical Multi-Select with Framer Motion Collapsible Tree) */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider font-heading flex items-center justify-between">
          <span>{t('shop.categoryFilter', 'Categories')}</span>
          {categories.items.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-400">
              ({categories.items.length})
            </span>
          )}
        </h4>
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {parentCategories.map((parent) => {
            const parentKey = String(parent._id);
            const subCats = subCategoriesMap[parentKey] || [];
            const hasSubCats = subCats.length > 0;
            const isParentChecked = selectedCategories.includes(parent.slug);
            const isExpanded = !!expandedParents[parentKey] || isParentChecked;
            const count = getCategoryCount(parent, subCats);

            return (
              <div key={parent._id} className="space-y-1">
                {/* Parent Category Row */}
                <div
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    isParentChecked
                      ? 'bg-[#E1F5FE] dark:bg-sky-950/60 text-[#0266C8] dark:text-sky-300 font-bold border border-[#BAE6FD]/80 dark:border-sky-800/40 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-[#F0F8FF] dark:hover:bg-slate-800/80 hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isParentChecked}
                      onChange={() => {
                        handleCategoryToggle(parent.slug);
                        if (!isExpanded && hasSubCats) {
                          setExpandedParents((prev) => ({ ...prev, [parentKey]: true }));
                        }
                      }}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8] cursor-pointer"
                    />
                    <span
                      className="truncate flex-1"
                      onClick={() => {
                        if (hasSubCats) {
                          setExpandedParents((prev) => ({ ...prev, [parentKey]: !isExpanded }));
                        } else {
                          handleCategoryToggle(parent.slug);
                        }
                      }}
                    >
                      {parent.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-1">
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">({count})</span>
                    )}
                    {hasSubCats && (
                      <button
                        type="button"
                        onClick={(e) => toggleParentExpand(parentKey, e)}
                        className="p-1 text-slate-400 hover:text-[#0266C8] dark:hover:text-sky-300 transition-colors"
                        aria-label="Toggle subcategories"
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <ChevronDown
                            size={14}
                            className={isExpanded ? 'text-[#0266C8] dark:text-sky-300' : ''}
                          />
                        </motion.div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories (Animated Height Expand/Collapse) */}
                <AnimatePresence initial={false}>
                  {hasSubCats && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden ml-3.5 pl-2.5 border-l-2 border-[#BAE6FD] dark:border-slate-800 space-y-1 py-1"
                    >
                      {subCats.map((sub) => {
                        const isSubChecked = selectedCategories.includes(sub.slug);
                        const subCount =
                          facetCategoryCounts[sub.slug] ?? facetCategoryCounts[sub._id];

                        return (
                          <label
                            key={sub._id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-150 ${
                              isSubChecked
                                ? 'bg-[#E1F5FE]/80 dark:bg-sky-950/50 text-[#0266C8] dark:text-sky-300 font-bold'
                                : isParentChecked
                                ? 'text-[#0266C8]/80 dark:text-sky-400/80 hover:bg-[#F0F8FF] dark:hover:bg-slate-800'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={isSubChecked}
                                onChange={() => handleCategoryToggle(sub.slug)}
                                className="w-3 h-3 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8] cursor-pointer"
                              />
                              <span className="truncate">{sub.name}</span>
                            </div>
                            {subCount !== undefined && (
                              <span className="text-[10px] text-slate-400">({subCount})</span>
                            )}
                          </label>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brands (Multi-Select) */}
      <div className="space-y-2 pt-4 border-t border-[#BAE6FD]/60 dark:border-slate-800">
        <h4 className="font-extrabold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider font-heading">
          {t('shop.brandFilter', 'Brands')}
        </h4>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
          {brands.items.map((b) => {
            const isChecked = selectedBrands.includes(b.slug);
            const count = facetBrandCounts[b.slug] ?? facetBrandCounts[b._id];
            return (
              <label
                key={b._id}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  isChecked
                    ? 'bg-[#E1F5FE] dark:bg-sky-950/60 text-[#0266C8] dark:text-sky-300 font-bold border border-[#BAE6FD]/80 dark:border-sky-800/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-[#F0F8FF] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(b.slug)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8] cursor-pointer"
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
              className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 ${
                minRating === ratingOption.value
                  ? 'bg-[#E1F5FE] dark:bg-sky-950/60 text-[#0266C8] dark:text-sky-300 font-bold border border-[#BAE6FD]/80 dark:border-sky-800/40 shadow-xs'
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
                  className="w-3.5 h-3.5 text-[#0266C8] focus:ring-[#0266C8] cursor-pointer"
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
            className="w-full px-3 py-2 text-xs bg-[#F0F8FF] dark:bg-slate-800 border border-[#BAE6FD] dark:border-slate-700 rounded-xl text-[#0a2540] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0266C8] transition-all"
          />
          <input
            type="number"
            placeholder={t('shop.maxPrice', 'Max')}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              updateUrlParams({ maxPrice: e.target.value || null });
            }}
            className="w-full px-3 py-2 text-xs bg-[#F0F8FF] dark:bg-slate-800 border border-[#BAE6FD] dark:border-slate-700 rounded-xl text-[#0a2540] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0266C8] transition-all"
          />
        </div>
      </div>
    </div>
  );

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: t('nav.shop', 'Shop Catalog') }]} />

      {/* Editorial Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-12 text-white shadow-xl border border-[#BAE6FD] dark:border-slate-800/80 bg-gradient-to-r from-[#0266C8] via-[#0054A6] to-[#0a2540] dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 transition-all duration-300">
        {/* Soft Radial Glow Accents */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-[#0266C8]/30 dark:bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          {/* Live Result Count Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-slate-700 text-sky-100 dark:text-slate-300">
            <Sparkles size={14} className="text-amber-300" />
            <span>
              {displayedProducts.length > 0
                ? `${displayedProducts.length} ${
                    displayedProducts.length === 1 ? 'Product Available' : 'Products Available'
                  }`
                : 'Boutique Collection'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight leading-tight">
            {isWishlistOnly
              ? t('wishlist.title', 'My Wishlist Collection')
              : isOnlySearchActive
              ? `${t('common.suggestions', 'Search Results')} "${searchQuery}"`
              : t('shop.title', 'Shop Product Catalog')}
          </h1>

          <p className="text-sm sm:text-base text-sky-100/90 dark:text-slate-300 font-body leading-relaxed max-w-2xl">
            {isWishlistOnly
              ? t('wishlist.subtitle', 'Your saved items for future purchases')
              : t('shop.subtitle', 'Browse top-quality electronics, smartphones, laptops, and lifestyle items with authentic warranty.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters (Desktop Floating Card) */}
        <aside className="hidden lg:block space-y-6 lg:col-span-1">
          <div className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-[#BAE6FD]/80 dark:border-slate-800/80 rounded-3xl shadow-[0_8px_32px_rgba(2,102,200,0.08)] space-y-6 sticky top-24">
            {renderFilterControls()}
          </div>
        </aside>

        {/* Mobile Filter Drawer Subcomponent (<lg screens) */}
        <MobileFilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          t={t}
          activeFilterCount={activeFilterCount}
          handleResetFilters={handleResetFilters}
        >
          {renderFilterControls()}
        </MobileFilterDrawer>

        {/* Right Main Grid Area */}
        <main className="space-y-6 lg:col-span-3">
          {/* Active Filter Chips Row with AnimatePresence */}
          {(searchQuery || selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || minRating || inStockOnly) && (
            <div className="flex flex-wrap items-center gap-2 p-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-[#BAE6FD]/80 dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter size={13} className="text-[#0266C8] dark:text-sky-400" />
                Active Filters:
              </span>

              <AnimatePresence>
                {searchQuery && (
                  <motion.span
                    key="search-chip"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E1F5FE] text-[#0266C8] dark:bg-sky-950 dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 shadow-2xs"
                  >
                    Search: "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        updateUrlParams({ search: null });
                      }}
                      className="hover:text-rose-500 transition-colors ml-0.5"
                      aria-label="Remove search keyword filter"
                    >
                      <X size={13} />
                    </button>
                  </motion.span>
                )}

                {selectedCategories.map((slug) => (
                  <motion.span
                    key={`cat-${slug}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E1F5FE] text-[#0266C8] dark:bg-sky-950 dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 shadow-2xs"
                  >
                    Category: {slug}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(slug)}
                      className="hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X size={13} />
                    </button>
                  </motion.span>
                ))}

                {selectedBrands.map((slug) => (
                  <motion.span
                    key={`brand-${slug}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E1F5FE] text-[#0266C8] dark:bg-sky-950 dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 shadow-2xs"
                  >
                    Brand: {slug}
                    <button
                      type="button"
                      onClick={() => handleBrandToggle(slug)}
                      className="hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X size={13} />
                    </button>
                  </motion.span>
                ))}

                {inStockOnly && (
                  <motion.span
                    key="instock-chip"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E1F5FE] text-[#0266C8] dark:bg-sky-950 dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800 shadow-2xs"
                  >
                    In Stock Only
                    <button
                      type="button"
                      onClick={() => {
                        setInStockOnly(false);
                        updateUrlParams({ inStock: null });
                      }}
                      className="hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X size={13} />
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Slim Glass Toolbar (Sort & Mobile Filter Trigger) */}
          <div className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-[#BAE6FD]/80 dark:border-slate-800/80 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button (visible < lg) */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0a2540] dark:text-white bg-white dark:bg-slate-800 border border-[#BAE6FD] dark:border-slate-700 rounded-xl shadow-2xs hover:bg-[#E1F5FE] dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <SlidersHorizontal size={15} className="text-[#0266C8] dark:text-sky-400" />
                <span>{t('shop.filterTitle', 'Filters')}</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0266C8] text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span>{t('shop.showingResults', { count: displayedProducts.length })}:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayedProducts.length}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="tabular-nums font-extrabold text-[#0266C8] dark:text-sky-400 text-sm"
                  >
                    {displayedProducts.length}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto ml-auto sm:ml-0">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                {t('shop.sortBy', 'Sort By:')}
              </span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                className="px-3.5 py-2 text-xs font-bold bg-[#F0F8FF] dark:bg-slate-800 text-[#0a2540] dark:text-slate-100 rounded-xl border border-[#BAE6FD] dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0266C8] transition-all cursor-pointer"
              >
                <option value="newest">{t('shop.sortNewest', 'Newest Arrivals')}</option>
                <option value="price_asc">{t('shop.sortPriceLowHigh', 'Price: Low to High')}</option>
                <option value="price_desc">{t('shop.sortPriceHighLow', 'Price: High to Low')}</option>
                <option value="rating">{t('shop.sortRating', 'Top Customer Rating')}</option>
              </select>
            </div>
          </div>

          {/* Products Grid with Framer Motion Stagger Entrance */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <ProductSkeleton count={6} />
            </div>
          ) : displayedProducts.length > 0 ? (
            <motion.div
              key={displayedProducts.map((p) => p._id).join(',')}
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {displayedProducts.map((prod) => (
                <motion.div key={prod._id} variants={gridItemVariants}>
                  <ProductCard
                    product={prod}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Premium Illustration Empty State */
            <div className="py-20 px-6 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-[#BAE6FD]/80 dark:border-slate-800 rounded-3xl space-y-5 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-100 to-sky-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-sky-200/60 dark:border-slate-700 shadow-inner">
                <PackageSearch size={36} className="text-[#0266C8] dark:text-sky-400" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-lg font-bold font-heading text-[#0a2540] dark:text-white">
                  No Matching Products
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body">
                  {searchQuery
                    ? `We couldn't find any results matching "${searchQuery}". Try searching with different keywords or clearing active filters.`
                    : t('shop.noProductsFound', 'No products found matching your active filters.')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#0266C8] hover:bg-[#0054A6] rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCcw size={14} />
                <span>{t('shop.clearFilters', 'Reset Search & Clear Filters')}</span>
              </button>
            </div>
          )}

          {/* Pill-Style Pagination Controls */}
          {!isWishlistOnly && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <motion.button
                whileHover={pagination.hasPrevPage ? { scale: 1.03 } : {}}
                whileTap={pagination.hasPrevPage ? { scale: 0.97 } : {}}
                disabled={!pagination.hasPrevPage}
                onClick={() => {
                  const prevPage = Math.max(1, currentPage - 1);
                  setCurrentPage(prevPage);
                  updateUrlParams({ page: prevPage > 1 ? prevPage : null });
                }}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-[#BAE6FD] dark:border-slate-800 rounded-xl text-xs font-bold text-[#0a2540] dark:text-slate-300 hover:bg-[#E1F5FE] dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </motion.button>

              <span className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                Page {pagination.page || currentPage} of {pagination.totalPages}
              </span>

              <motion.button
                whileHover={pagination.hasNextPage ? { scale: 1.03 } : {}}
                whileTap={pagination.hasNextPage ? { scale: 0.97 } : {}}
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  updateUrlParams({ page: nextPage });
                }}
                className="px-4 py-2 bg-[#0266C8] hover:bg-[#0054A6] text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500"
              >
                Next
              </motion.button>
            </div>
          )}
        </main>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </PageTransition>
  );
};
