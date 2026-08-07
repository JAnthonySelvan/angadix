import React from 'react';
import { History, Sparkles } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { selectRecentlyViewedItems } from '../../features/recentlyViewed/recentlyViewedSlice';
import { ProductCard } from './ProductCard';

export const RecentlyViewed = ({ currentProductId = null, onQuickView }) => {
  const allRecentItems = useAppSelector(selectRecentlyViewedItems);

  const filteredItems = currentProductId
    ? allRecentItems.filter((p) => String(p._id || p.id || p) !== String(currentProductId))
    : allRecentItems;

  const displayItems = filteredItems.slice(0, 4);

  if (displayItems.length === 0) return null;

  return (
    <section className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <History size={20} />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Recently Viewed</span>
              <Sparkles size={14} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Pick up right where you left off
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {displayItems.map((prod) => (
          <ProductCard key={prod._id || prod.id} product={prod} onQuickView={onQuickView} />
        ))}
      </div>
    </section>
  );
};
