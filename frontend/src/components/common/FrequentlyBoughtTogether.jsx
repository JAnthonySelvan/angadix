import React from 'react';
import { Sparkles, Plus, ShoppingBag, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addItemToCart } from '../../features/cart/cartThunks';
import { useRequireAuth } from '../../utils/useRequireAuth';
import toast from 'react-hot-toast';

export const FrequentlyBoughtTogether = ({ mainProduct = null }) => {
  const dispatch = useAppDispatch();
  const { requireAuth } = useRequireAuth();

  const apiRecommendations = useAppSelector(
    (state) => state.products.recommendations?.frequentlyBoughtTogether
  ) || [];
  const allProducts = useAppSelector((state) => state.products.items) || [];
  const homepageProducts = useAppSelector(
    (state) => state.products.homepageProducts?.featured
  ) || [];
  const cartItems = useAppSelector((state) => state.cart.items);

  const availableCatalog = [...allProducts, ...homepageProducts];

  // Primary: Use API frequently bought together recommendations if available
  // Fallback: Pick 2 candidates matching mainProduct
  const recommendations = (
    apiRecommendations.length > 0
      ? apiRecommendations
      : availableCatalog.filter((p) => {
          if (!p || !p._id) return false;
          if (mainProduct && p._id === mainProduct._id) return false;
          const isInCart = cartItems.some(
            (ci) => ci.product?._id === p._id || ci.product === p._id
          );
          return !isInCart && p.stock > 0;
        })
  ).slice(0, 3);

  if (recommendations.length === 0) return null;

  const handleAddBundle = () => {
    if (!requireAuth(null, 'Please sign in to add items to your cart')) {
      return;
    }
    recommendations.forEach((prod) => {
      dispatch(addItemToCart({ productId: prod._id, quantity: 1 }));
    });
    toast.success('Recommended bundle added to cart!');
  };

  const bundleTotal = recommendations.reduce(
    (sum, p) => sum + (p.discountPrice || p.price),
    0
  );

  return (
    <section className="neu-card p-5 sm:p-6 bg-gradient-to-br from-white via-sky-50/40 to-primary-50/30 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Frequently Bought Together</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                AI Match
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Customers often pair these items for maximum value
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        {/* Bundle Items Cards */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {recommendations.map((prod, idx) => {
            const price = prod.discountPrice || prod.price;
            const img =
              prod.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300';

            return (
              <React.Fragment key={prod._id}>
                {idx > 0 && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-black">
                    <Plus size={16} />
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 shadow-xs max-w-xs flex-1 min-w-[200px]">
                  <img
                    src={img}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-50 dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-0.5">
                      ₹{price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bundle Action Box */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800/90 p-3.5 px-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm w-full md:w-auto justify-between md:justify-end">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
              Bundle Total
            </span>
            <span className="font-black text-lg text-primary-600 dark:text-primary-400">
              ₹{bundleTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddBundle}
            className="py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary-600/30 flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag size={15} />
            <span>Add Bundle to Cart</span>
          </button>
        </div>
      </div>
    </section>
  );
};
