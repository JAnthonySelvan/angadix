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
      className={`animate-pulse bg-slate-200/80 ${
        circle ? 'rounded-full' : 'rounded-lg'
      } ${className}`}
    />
  );
};
