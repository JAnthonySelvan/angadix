import React from 'react';

export const ProductSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="neu-card p-4 flex flex-col justify-between animate-pulse bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl"
        >
          <div>
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />

            {/* Category Pill Placeholder */}
            <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-2" />

            {/* Title Placeholder */}
            <div className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
            <div className="w-2/3 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-3" />

            {/* Rating Stars Placeholder */}
            <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
          </div>

          {/* Price & Action Placeholder */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};
