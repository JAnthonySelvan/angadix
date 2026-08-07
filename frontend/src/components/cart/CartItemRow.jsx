import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Heart, Bookmark, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateCartItem, removeCartItem } from '../../features/cart/cartThunks';
import { addWishlistItem } from '../../features/wishlist/wishlistThunks';
import { selectIsInWishlist } from '../../features/wishlist/wishlistSlice';
import { moveCartItemToSaved } from '../../features/savedForLater/savedForLaterThunks';
import { getProductImageUrl } from '../../utils/orderHelpers';
import toast from 'react-hot-toast';

export const CartItemRow = ({ item, isCompact = false }) => {
  const dispatch = useAppDispatch();

  if (!item || !item.product) return null;

  const { product, quantity = 1, unavailable } = item;
  const productId = product._id;
  const isInWishlist = useAppSelector(selectIsInWishlist(productId));

  const isOutOfStock = unavailable || product.stock <= 0 || product.isActive === false;
  const itemPrice = product.discountPrice || product.price || 0;
  const lineTotal = itemPrice * quantity;

  const primaryImage = getProductImageUrl(product.images);

  const handleQuantityIncrease = () => {
    if (product.stock && quantity >= product.stock) {
      toast.error(`Only ${product.stock} units available in stock.`);
      return;
    }
    dispatch(updateCartItem({ productId, quantity: quantity + 1 }));
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      dispatch(updateCartItem({ productId, quantity: quantity - 1 }));
    } else {
      dispatch(removeCartItem(productId));
      toast.success(`Removed "${product.name}" from cart`);
    }
  };

  const handleMoveToWishlist = () => {
    if (!isInWishlist) {
      dispatch(addWishlistItem(productId));
    }
    dispatch(removeCartItem(productId));
    toast.success(`Moved "${product.name}" to Wishlist`);
  };

  const handleMoveToSaved = () => {
    dispatch(moveCartItemToSaved(productId));
    toast.success(`Saved "${product.name}" for later`);
  };

  const handleRemove = () => {
    dispatch(removeCartItem(productId));
    toast.success(`Removed "${product.name}" from cart`);
  };

  if (isCompact) {
    return (
      <div className="flex gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xs transition-all hover:shadow-sm">
        {/* Thumbnail */}
        <Link to={`/products/${product.slug}`} className="flex-shrink-0 relative group">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-contain bg-slate-50 dark:bg-slate-900 p-1.5 border border-slate-100 dark:border-slate-800"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex items-center justify-center text-white">
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-1">
              <Link
                to={`/products/${product.slug}`}
                className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {product.name}
              </Link>
              <button
                onClick={handleRemove}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                title="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full mt-1">
                <AlertTriangle size={10} />
                <span>Unavailable / Out of Stock</span>
              </span>
            ) : (
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                ₹{itemPrice.toLocaleString('en-IN')}
                {product.discountPrice && (
                  <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Stepper + Subtotal */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={handleQuantityDecrease}
                  className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {quantity}
                </span>
                <button
                  onClick={handleQuantityIncrease}
                  disabled={isOutOfStock}
                  className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Action Icons */}
              <button
                onClick={handleMoveToSaved}
                className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                title="Save for Later"
              >
                <Bookmark size={13} />
              </button>
            </div>

            <span className="font-black text-xs text-slate-900 dark:text-white">
              ₹{lineTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full Row Variant (for Cart Page / Desktop review)
  return (
    <div className="neu-card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-200 dark:hover:border-slate-700">
      {/* Thumbnail + Name */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link to={`/products/${product.slug}`} className="flex-shrink-0 relative group">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
          )}
        </Link>

        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {product.category?.name || 'Electronics'}
          </p>
          <Link
            to={`/products/${product.slug}`}
            className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          {isOutOfStock ? (
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                <AlertTriangle size={12} />
                <span>Unavailable / Out of Stock</span>
              </span>
              <button
                onClick={handleRemove}
                className="text-xs font-bold text-rose-600 underline hover:text-rose-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                ₹{itemPrice.toLocaleString('en-IN')}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}

          {/* Action Row Links */}
          <div className="flex items-center gap-4 pt-2 text-xs font-bold text-slate-500">
            <button
              onClick={handleMoveToSaved}
              className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              <Bookmark size={14} />
              <span>Save for Later</span>
            </button>

            <button
              onClick={handleMoveToWishlist}
              className="inline-flex items-center gap-1 hover:text-rose-500 transition-colors"
            >
              <Heart size={14} className={isInWishlist ? 'fill-rose-500 text-rose-500' : ''} />
              <span>{isInWishlist ? 'In Wishlist' : 'Move to Wishlist'}</span>
            </button>

            <button
              onClick={handleRemove}
              className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors text-slate-400 hover:text-rose-500"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stepper + Subtotal (Desktop Right) */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
          <button
            onClick={handleQuantityDecrease}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="px-4 text-xs font-extrabold text-slate-900 dark:text-white">
            {quantity}
          </span>
          <button
            onClick={handleQuantityIncrease}
            disabled={isOutOfStock}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Subtotal
          </span>
          <span className="font-extrabold text-base text-primary-600 dark:text-primary-400">
            ₹{lineTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
