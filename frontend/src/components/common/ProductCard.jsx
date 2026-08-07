import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
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
import { getProductImageUrl } from '../../utils/orderHelpers';
import toast from 'react-hot-toast';

export const ProductCard = ({ product, onQuickView }) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isInWishlist = useAppSelector(selectIsInWishlist(product?._id));
  const { requireAuth, isAuthenticated } = useRequireAuth();

  const [isHovered, setIsHovered] = useState(false);

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
    isFeatured,
    isBestSeller,
    category,
    stock = 10,
  } = product;

  // Primary image fallback
  const primaryImage = getProductImageUrl(images);

  // Calculate discount percentage
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const finalPrice = hasDiscount ? discountPrice : price;

  // State check for cart
  const isInCart = cartItems.some(
    (item) => item.product?._id === _id || item.product === _id
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!requireAuth(null, 'Please sign in to add items to your cart')) {
      return;
    }

    if (stock <= 0) {
      toast.error('Product is out of stock!');
      return;
    }
    dispatch(addItemToCart({ productId: _id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success(`${name} added to cart!`))
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      const currentGuestWishlist = loadGuestWishlistFromStorage();
      const targetId = String(_id);
      const existsIndex = currentGuestWishlist.findIndex((item) => {
        const itemId = item._id || item.id || item.product?._id || item;
        return String(itemId) === targetId;
      });

      let updated;
      if (existsIndex > -1) {
        updated = currentGuestWishlist.filter((_, idx) => idx !== existsIndex);
        toast.success('Removed from wishlist');
      } else {
        updated = [...currentGuestWishlist, product];
        toast.success('Saved to wishlist');
      }

      saveGuestWishlistToStorage(updated);
      dispatch(setGuestWishlistItems(updated));
      return;
    }

    if (isInWishlist) {
      dispatch(removeWishlistItem(_id))
        .unwrap()
        .then(() => toast.success('Removed from wishlist'))
        .catch((err) => toast.error(err || 'Failed to remove from wishlist'));
    } else {
      dispatch(addWishlistItem(_id))
        .unwrap()
        .then(() => toast.success('Saved to wishlist'))
        .catch((err) => toast.error(err || 'Failed to add to wishlist'));
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-white via-[#F0F8FF] to-[#E1F5FE] dark:from-slate-800 dark:to-slate-900 border border-[#BAE6FD] dark:border-slate-700/80 rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      aria-label={`Product card for ${name}`}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail & Badges */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-[#D8EEFE]/70 dark:from-slate-900/60 dark:to-slate-800/60">
        <Link to={`/products/${slug}`}>
          <img
            src={primaryImage}
            alt={name}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&auto=format';
            }}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isBestSeller && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#0266C8] text-white font-heading shadow-sm">
              Bestseller
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-white font-heading shadow-sm">
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white font-heading shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Action Floating Buttons Top Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          <button
            onClick={handleToggleWishlist}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              size={15}
              className={isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}
            />
          </button>

          <button
            onClick={handleQuickView}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            title="Quick View"
          >
            <Eye size={15} className="text-slate-600 dark:text-slate-300 hover:text-slate-900" />
          </button>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-1 gap-2 bg-gradient-to-br from-white/60 via-[#F0F8FF]/80 to-[#E1F5FE] dark:from-slate-800/90 dark:to-slate-900/90">
        <p className="text-xs text-[#0D78D6] dark:text-sky-400 font-bold uppercase tracking-wider">
          {category?.name || 'Electronics'}
        </p>

        <Link to={`/products/${slug}`} className="group-hover:text-[#0266C8] transition-colors">
          <h3 className="font-heading font-semibold text-[#0a2540] dark:text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center gap-1 my-0.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(ratingsAverage) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-body">
            ({ratingsCount > 0 ? ratingsCount : 128})
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="font-heading font-extrabold text-[#0266C8] dark:text-sky-400 text-base">
            ₹{finalPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-500 line-through font-body">
              ₹{price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`mt-2 w-full py-2.5 rounded-lg text-xs font-bold font-body transition-all duration-200 flex items-center justify-center gap-2 ${
            stock <= 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
              : isInCart
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
              : 'bg-[#0266C8] hover:bg-[#0054A6] text-white shadow-md hover:shadow-lg'
          }`}
        >
          <ShoppingCart size={14} />
          <span>{isInCart ? 'In Cart' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </motion.div>
  );
};
