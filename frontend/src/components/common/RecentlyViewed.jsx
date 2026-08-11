import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { selectRecentlyViewedItems } from '../../features/recentlyViewed/recentlyViewedSlice';
import { PremiumProductCard } from './ProductCard';

export const RecentlyViewed = ({ currentProductId = null, onQuickView }) => {
  const allRecentItems = useAppSelector(selectRecentlyViewedItems);
  const scrollRef = useRef(null);

  const filteredItems = currentProductId
    ? allRecentItems.filter((p) => String(p._id || p.id || p) !== String(currentProductId))
    : allRecentItems;

  const displayItems = filteredItems.slice(0, 8);

  if (displayItems.length === 0) return null;

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#1d1d1f] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 font-body block mb-2">
              RECENTLY VIEWED
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#0a2540] dark:text-white">
              Recently Viewed
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-body mt-2">
              Pick up right where you left off.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Scroll Strip */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayItems.map((prod) => (
            <div key={prod._id || prod.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
              <PremiumProductCard product={prod} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

