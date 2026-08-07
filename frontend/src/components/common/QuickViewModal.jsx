import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addItemToCart } from '../../features/cart/cartThunks';
import { addWishlistItem, removeWishlistItem } from '../../features/wishlist/wishlistThunks';
import { selectIsInWishlist } from '../../features/wishlist/wishlistSlice';
import { useRequireAuth } from '../../utils/useRequireAuth';
import toast from 'react-hot-toast';

export const QuickViewModal = ({ product, isOpen = true, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();
  const isInWishlist = useAppSelector(selectIsInWishlist(product?._id));
  const { requireAuth } = useRequireAuth();

  if (!isOpen || !product) return null;

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
  } = product;

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const displayPrice = (discountPrice || price).toLocaleString('en-IN');
  const originalPrice = discountPrice ? price.toLocaleString('en-IN') : null;

  const allImages = images.length > 0
    ? images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'];

  const handleAddToCart = () => {
    if (!requireAuth(null, 'Please sign in to add items to your cart')) {
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity }))
      .unwrap()
      .then(() => {
        toast.success(`Added ${quantity} x "${name}" to Cart!`);
        onClose();
      })
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const handleWishlist = () => {
    if (!requireAuth(null, 'Please sign in to save items to your wishlist')) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Gallery */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <div className="w-full h-72 sm:h-80 flex items-center justify-center p-4">
                <img
                  src={allImages[selectedImageIndex]}
                  alt={name}
                  className="max-h-full max-w-full object-contain drop-shadow-lg"
                />
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto max-w-full py-1">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-primary-600 scale-105 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                {/* Category & Brand Pills */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-full">
                    {category?.name || 'Category'}
                  </span>
                  {brand && (
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      {brand.name}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                  {name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(ratingsAverage) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {ratingsAverage.toFixed(1)} ({ratingsCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {currencySymbol}{displayPrice}
                  </span>
                  {originalPrice && (
                    <span className="text-base font-semibold text-slate-400 line-through">
                      {currencySymbol}{originalPrice}
                    </span>
                  )}
                  {discountPrice && (
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      SAVE {currencySymbol}{(price - discountPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6">
                  {shortDescription || description}
                </p>

                {/* Key Specs if present */}
                {specifications.length > 0 && (
                  <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
                    {specifications.slice(0, 4).map((spec, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-medium">{spec.key}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 font-bold text-sm text-slate-800 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-xl border transition-all ${
                      isInWishlist
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart size={18} className={isInWishlist ? 'fill-white' : ''} />
                  </button>
                </div>

                {/* Service Icons */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck size={16} className="text-primary-500" />
                    <span>Free Express Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>100% Authentic</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RefreshCw size={16} className="text-indigo-500" />
                    <span>30-Day Easy Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
