import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProductBySlug, fetchFrequentlyBoughtTogether } from '../features/products/productThunks';
import { addItemToCart } from '../features/cart/cartThunks';
import { addWishlistItem, removeWishlistItem } from '../features/wishlist/wishlistThunks';
import {
  selectIsInWishlist,
  loadGuestWishlistFromStorage,
  saveGuestWishlistToStorage,
  setGuestWishlistItems,
} from '../features/wishlist/wishlistSlice';
import { trackProductView } from '../features/recentlyViewed/recentlyViewedSlice';
import { useRequireAuth } from '../utils/useRequireAuth';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { RecentlyViewed } from '../components/common/RecentlyViewed';
import { FrequentlyBoughtTogether } from '../components/common/FrequentlyBoughtTogether';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ProductReviews } from '../components/reviews/ProductReviews';
import { getProductImageUrl, getRawProductImageUrl, handleProductImageError } from '../utils/orderHelpers';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/common/PageTransition';
import toast from 'react-hot-toast';

export const ProductDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { requireAuth, isAuthenticated } = useRequireAuth();

  const {
    data: product,
    relatedProducts = [],
    similarProducts = [],
    loading,
    error,
  } = useAppSelector((state) => state.products.selectedProduct);
  const frequentlyBoughtTogether = useAppSelector(
    (state) => state.products.recommendations?.frequentlyBoughtTogether || []
  );

  const isInWishlist = useAppSelector(selectIsInWishlist(product?._id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useDocumentTitle(product?.name || 'Product Details');

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (product && product._id) {
      dispatch(trackProductView(product));
      dispatch(fetchFrequentlyBoughtTogether(product._id));
    }
  }, [product, dispatch]);

  if (loading) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <span className="text-slate-300">/</span>
          <Skeleton className="h-4 w-24" />
          <span className="text-slate-300">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="neu-card p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full h-80 sm:h-96 rounded-2xl" />
              <div className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="w-16 h-16 rounded-xl" />
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-40" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-28 rounded-xl" />
                  <Skeleton className="h-12 flex-1 rounded-xl" />
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {t('common.noResults', 'Product Not Found')}
        </h2>
        <p className="text-xs text-slate-500">{error || 'The requested product slug does not exist.'}</p>
        <Link to="/shop" className="inline-block px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-xl">
          {t('common.back', 'Return to Shop')}
        </Link>
      </div>
    );
  }

  const {
    name,
    description,
    shortDescription,
    price,
    discountPrice,
    currency = 'INR',
    stock = 10,
    images = [],
    ratingsAverage = 4.8,
    ratingsCount = 42,
    category,
    brand,
    specifications = [],
    tags = [],
  } = product;

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const rawPrice = discountPrice ?? price ?? 0;
  const displayPrice = Number(rawPrice).toLocaleString('en-IN');
  const originalPrice = discountPrice && price ? Number(price).toLocaleString('en-IN') : null;

  const rawImages = images && images.length > 0
    ? images.map((img) => getRawProductImageUrl(img)).filter(Boolean)
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'];

  const allImages = images && images.length > 0
    ? images.map((img) => getProductImageUrl(img)).filter(Boolean)
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'];

  const handleAddToCart = () => {
    if (!requireAuth(null, 'Please sign in to add items to your cart')) {
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity }))
      .unwrap()
      .then(() => toast.success(`Added ${quantity} x "${name}" to Cart!`))
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      const currentGuestWishlist = loadGuestWishlistFromStorage();
      const targetId = String(product._id);
      const existsIndex = currentGuestWishlist.findIndex((item) => {
        const itemId = item._id || item.id || item.product?._id || item;
        return String(itemId) === targetId;
      });

      let updated;
      if (existsIndex > -1) {
        updated = currentGuestWishlist.filter((_, idx) => idx !== existsIndex);
        toast.success('Removed from Wishlist');
      } else {
        updated = [...currentGuestWishlist, product];
        toast.success('Saved to Wishlist!');
      }

      saveGuestWishlistToStorage(updated);
      dispatch(setGuestWishlistItems(updated));
      return;
    }

    if (isInWishlist) {
      dispatch(removeWishlistItem(product._id))
        .unwrap()
        .then(() => toast.success('Removed from Wishlist'))
        .catch((err) => toast.error(err));
    } else {
      dispatch(addWishlistItem(product._id))
        .unwrap()
        .then(() => toast.success('Saved to Wishlist!'))
        .catch((err) => toast.error(err));
    }
  };

  const jsonLdSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    image: allImages,
    description: shortDescription || description,
    sku: product.sku || product._id,
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: discountPrice || price,
      availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(ratingsCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingsAverage,
        reviewCount: ratingsCount,
      },
    }),
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* JSON-LD Structured Data Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.shop', 'Shop'), to: '/shop' },
          { label: category?.name || 'Category', to: `/shop?category=${category?.slug}` },
          { label: name },
        ]}
      />

      <div className="neu-card p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-transparent p-6 flex items-center justify-center border-none">
              <img
                src={allImages[selectedImage]}
                alt={name}
                onError={(e) => handleProductImageError(e, rawImages[selectedImage])}
                className="max-h-full max-w-full object-contain bg-transparent mix-blend-multiply dark:mix-blend-normal"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === idx
                        ? 'border-primary-600 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Brand */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full">
                  {category?.name || 'Category'}
                </span>
                {brand && (
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {brand.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(ratingsAverage) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {(ratingsAverage || 0).toFixed(1)} ({ratingsCount || 0} verified reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {currencySymbol}{displayPrice}
                </span>
                {originalPrice && (
                  <span className="text-lg font-semibold text-slate-400 line-through">
                    {currencySymbol}{originalPrice}
                  </span>
                )}
                {discountPrice && (
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    SAVE {currencySymbol}{(price - discountPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                {description}
              </p>

              {/* Specifications */}
              {specifications.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {specifications.map((spec, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-medium">{spec.key}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-sm text-slate-800 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleWishlist}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isInWishlist
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Heart size={18} className={isInWishlist ? 'fill-white' : ''} />
                </button>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Truck size={15} className="text-primary-500" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>Original Warranty</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <RefreshCw size={15} className="text-indigo-500" />
                  <span>30-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Section 1: You May Also Like (Related Products) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                You May Also Like
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Top rated products from the same category
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommendation Section 2: Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Similar Products
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Recommended based on brand and matching features
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Ratings */}
      <ProductReviews productId={product._id} />

      {/* Recommendation Section 3: AI Frequently Bought Together */}
      <FrequentlyBoughtTogether mainProduct={product} />

      {/* Recommendation Section 4: Recently Viewed History */}
      <RecentlyViewed currentProductId={product._id} onQuickView={(p) => setQuickViewProduct(p)} />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </PageTransition>
  );
};

