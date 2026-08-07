import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectWishlistItems,
  loadGuestWishlistFromStorage,
  setGuestWishlistItems,
} from '../features/wishlist/wishlistSlice';
import { fetchWishlist } from '../features/wishlist/wishlistThunks';
import { ProductCard } from '../components/common/ProductCard';

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistItems = useAppSelector(selectWishlistItems);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      dispatch(setGuestWishlistItems(loadGuestWishlistFromStorage()));
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/30">
            <Heart size={24} className="fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Keep track of your favorite products and move them to cart anytime
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs self-start sm:self-center">
          <Sparkles size={14} />
          <span>{wishlistItems.length} Saved Favorites</span>
        </span>
      </div>

      {/* Wishlist Content */}
      {wishlistItems.length === 0 ? (
        /* Empty State */
        <div className="neu-card p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-5 max-w-lg mx-auto">
          <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 mx-auto shadow-inner">
            <Heart size={44} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save items you love by clicking the heart icon on product cards while browsing the store.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary-600/30 transition-all"
          >
            <span>Explore Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
