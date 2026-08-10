import React from 'react';

export const Skeleton = ({
  className = '',
  width,
  height,
  circle = false,
}) => {
  return (
    <div
      style={{ width, height }}
      className={`animate-pulse skeleton-shimmer bg-slate-200/80 dark:bg-slate-800/80 ${
        circle ? 'rounded-full' : 'rounded-lg'
      } ${className}`}
    />
  );
};
