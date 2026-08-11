import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addItemToCart } from '../../features/cart/cartThunks';
import { addWishlistItem, removeWishlistItem } from '../../features/wishlist/wishlistThunks';
import {
  selectIsInWishlist,
  loadGuestWishlistFromStorage,
  saveGuestWishlistToStorage,
  setGuestWishlistItems,
} from '../../features/wishlist/wishlistSlice';
import { useRequireAuth } from '../../utils/useRequireAuth';
import { getProductImageUrl, getRawProductImageUrl, handleProductImageError } from '../../utils/orderHelpers';
import toast from 'react-hot-toast';

export const ProductImageWrapper = ({
  src,
  alt,
  rawImage,
  slug,
  className = '',
  imgClassName = '',
  maxHeightClass = 'max-h-48 sm:max-h-52',
  children,
}) => {
  const content = (
    <img
      src={src}
      alt={alt}
      onError={(e) => handleProductImageError(e, rawImage)}
      className={`w-full h-full ${maxHeightClass} object-contain bg-transparent mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500 ease-out ${imgClassName}`}
      loading="lazy"
    />
  );

  return (
    <div className={`relative overflow-hidden bg-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-center aspect-square ${className}`}>
      {slug ? (
        <Link to={`/products/${slug}`} className="w-full h-full flex items-center justify-center">
          {content}
        </Link>
      ) : (
        content
      )}
      {children}
    </div>
  );
};

export const PremiumProductCard = ({ product, onQuickView }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isInWishlist = useAppSelector(selectIsInWishlist(product?._id));
  const { requireAuth, isAuthenticated } = useRequireAuth();

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  if (!product) return null;

  const {
    _id,
    name,
    slug,
    price = 0,
    discountPrice,
    images = [],
    ratingsAverage = 4.5,
    ratingsCount = 0,
    category,
    stock = 10,
  } = product;

  const primaryImage = getProductImageUrl(images);
  const rawImage = getRawProductImageUrl(images);
  const hasDiscount = discountPrice && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;

  const isInCart = cartItems.some(
    (item) => item.product?._id === _id || item.product === _id
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!requireAuth(null, t('toasts.loginRequired', 'Please sign in to add items to your cart'))) {
      return;
    }

    if (stock <= 0) {
      toast.error(t('common.outOfStock', 'Product is out of stock!'));
      return;
    }
    dispatch(addItemToCart({ productId: _id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success(t('toasts.addedToCart', 'Added to cart successfully!')))
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const confirmRemoveWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRemoveConfirm(false);

    if (!isAuthenticated) {
      const currentGuestWishlist = loadGuestWishlistFromStorage();
      const targetId = String(_id);
      const updated = currentGuestWishlist.filter((item) => {
        const itemId = item._id || item.id || item.product?._id || item;
        return String(itemId) !== targetId;
      });
      saveGuestWishlistToStorage(updated);
      dispatch(setGuestWishlistItems(updated));
      toast.success(t('toasts.removedFromWishlist', 'Removed from wishlist'));
      return;
    }

    dispatch(removeWishlistItem(_id))
      .unwrap()
      .then(() => toast.success(t('toasts.removedFromWishlist', 'Removed from wishlist')))
      .catch((err) => toast.error(err || 'Failed to remove from wishlist'));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      setShowRemoveConfirm(true);
      return;
    }

    if (!isAuthenticated) {
      const currentGuestWishlist = loadGuestWishlistFromStorage();
      const updated = [...currentGuestWishlist, product];
      saveGuestWishlistToStorage(updated);
      dispatch(setGuestWishlistItems(updated));
      toast.success(t('toasts.addedToWishlist', 'Saved to wishlist'));
      return;
    }

    dispatch(addWishlistItem(_id))
      .unwrap()
      .then(() => toast.success(t('toasts.addedToWishlist', 'Saved to wishlist')))
      .catch((err) => toast.error(err || 'Failed to add to wishlist'));
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const categoryName = typeof category === 'object' ? category?.name : category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-b from-white via-white to-[#f0f8ff] dark:from-[#111927] dark:to-[#0b101d] border border-[#0266C8]/15 dark:border-sky-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between group hover:border-[#0266C8]/40 dark:hover:border-sky-400/40 hover:shadow-[0_20px_45px_rgba(2,102,200,0.12)] dark:hover:shadow-[0_20px_45px_rgba(2,102,200,0.35)] transition-all duration-300 relative h-full"
      aria-label={`Product card for ${name}`}
      onMouseLeave={() => setShowRemoveConfirm(false)}
    >
      {/* Top Image Container */}
      <ProductImageWrapper
        src={primaryImage}
        alt={name}
        rawImage={rawImage}
        slug={slug}
        className="mb-5"
      >

        {/* Minimal Action Overlay Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <div className="relative">
            <button
              onClick={handleToggleWishlist}
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-black shadow-xs transition-all"
              title={isInWishlist ? t('product.removeFromWishlist', 'Remove from Wishlist') : t('product.addToWishlist', 'Add to Wishlist')}
            >
              <Heart
                size={14}
                className={isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'}
              />
            </button>

            {/* Inline Confirm Popover */}
            {showRemoveConfirm && (
              <div className="absolute top-10 right-0 z-30 w-44 p-2.5 bg-white dark:bg-[#1d1d1f] border border-slate-200 dark:border-white/15 rounded-xl shadow-2xl text-center space-y-2">
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  {t('wishlist.removeConfirm', 'Remove item?')}
                </p>
                <div className="flex gap-1.5 justify-center">
                  <button
                    onClick={confirmRemoveWishlist}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs"
                  >
                    {t('common.remove', 'Remove')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowRemoveConfirm(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-black shadow-xs transition-all opacity-0 group-hover:opacity-100"
              title={t('common.quickView', 'Quick View')}
            >
              <Eye size={14} className="text-slate-600 dark:text-slate-300" />
            </button>
          )}
        </div>
      </ProductImageWrapper>

      {/* Content Details */}
      <div className="flex flex-col flex-1">
        {/* Eyebrow Category */}
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 tracking-[0.2em] uppercase font-body mb-1 truncate">
          {categoryName || 'TECHNOLOGY'}
        </p>

        {/* Title */}
        <Link to={`/products/${slug}`} className="block mb-2">
          <h3 className="font-heading font-semibold text-[#0a2540] dark:text-white text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-[#0266C8] dark:group-hover:text-sky-400 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Minimal Price & Ghost Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-body font-medium uppercase tracking-wider">From</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-[#0a2540] dark:text-white text-base sm:text-lg">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-body">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/products/${slug}`}
              className="text-xs font-semibold text-[#0266C8] dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 group/link"
            >
              <span>{t('common.learnMore', 'Learn more')}</span>
              <ChevronRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                stock <= 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : isInCart
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-[#0266C8]/10 dark:bg-sky-500/10 text-[#0266C8] dark:text-sky-400 hover:bg-[#0266C8] hover:text-white dark:hover:bg-sky-500 dark:hover:text-white'
              }`}
            >
              {isInCart ? t('common.inCart', 'In Cart') : t('common.buy', 'Buy')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductCard = ({ product, onQuickView }) => {
  return <PremiumProductCard product={product} onQuickView={onQuickView} />;
};
