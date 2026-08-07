import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ShoppingCart, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSavedForLaterItems } from '../../features/savedForLater/savedForLaterSlice';
import { moveSavedItemToCart, removeSavedItem } from '../../features/savedForLater/savedForLaterThunks';
import { getProductImageUrl } from '../../utils/orderHelpers';
import toast from 'react-hot-toast';

export const SavedForLaterSection = () => {
  const dispatch = useAppDispatch();
  const savedItems = useAppSelector(selectSavedForLaterItems);

  if (savedItems.length === 0) return null;

  const handleMoveToCart = (productId, productName) => {
    dispatch(moveSavedItemToCart(productId));
    toast.success(`Moved "${productName}" back to Cart`);
  };

  const handleRemove = (productId, productName) => {
    dispatch(removeSavedItem(productId));
    toast.success(`Removed "${productName}" from Saved for Later`);
  };

  return (
    <section className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Bookmark size={20} />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Saved for Later
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} stashed for future review
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savedItems.map(({ product, quantity = 1 }) => {
          if (!product) return null;
          const isOutOfStock = product.stock <= 0 || product.isActive === false;
          const itemPrice = product.discountPrice || product.price || 0;
          const primaryImage = getProductImageUrl(product.images);

          return (
            <div
              key={product._id}
              className="neu-card p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex gap-3 items-center justify-between transition-all hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Link to={`/products/${product.slug}`} className="flex-shrink-0">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-100 dark:border-slate-800"
                  />
                </Link>

                <div className="min-w-0">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-primary-600 transition-colors"
                  >
                    {product.name}
                  </Link>

                  <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-0.5">
                    ₹{itemPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      (Qty: {quantity})
                    </span>
                  </p>

                  <div className="mt-1">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={11} /> Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={11} /> In stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleMoveToCart(product._id, product.name)}
                  disabled={isOutOfStock}
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all"
                >
                  <ShoppingCart size={13} />
                  <span>Move to Cart</span>
                </button>

                <button
                  onClick={() => handleRemove(product._id, product.name)}
                  className="px-3 py-1 text-slate-400 hover:text-rose-500 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
