import React from 'react';

/**
 * StatusBadge Component
 * Semantic color badges for active/inactive, blocked/active, roles, stock levels, expired coupons, order statuses.
 */
export const StatusBadge = ({ type, value, label }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let displayLabel = label || value;

  if (type === 'active') {
    const isAct = Boolean(value);
    displayLabel = isAct ? 'Active' : 'Inactive';
    badgeStyle = isAct
      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50';
  } else if (type === 'blocked') {
    const isBlk = Boolean(value);
    displayLabel = isBlk ? 'Blocked' : 'Active';
    badgeStyle = isBlk
      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/50'
      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50';
  } else if (type === 'role') {
    displayLabel = String(value).toUpperCase();
    badgeStyle =
      value === 'admin'
        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/50'
        : 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/50';
  } else if (type === 'stock') {
    const stockVal = Number(value || 0);
    if (stockVal <= 0) {
      displayLabel = 'Out of Stock';
      badgeStyle = 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
    } else if (stockVal <= 10) {
      displayLabel = 'Low Stock';
      badgeStyle = 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
    } else {
      displayLabel = 'In Stock';
      badgeStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
    }
  } else if (type === 'coupon') {
    const { validUntil, isActive: isAct } = value || {};
    const isExpired = validUntil ? new Date(validUntil) < new Date() : false;
    if (isExpired) {
      displayLabel = 'Expired';
      badgeStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300/50';
    } else if (isAct) {
      displayLabel = 'Active';
      badgeStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
    } else {
      displayLabel = 'Inactive';
      badgeStyle = 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
    }
  } else if (type === 'order') {
    displayLabel = String(value).toUpperCase();
    switch (String(value).toLowerCase()) {
      case 'delivered':
        badgeStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
        break;
      case 'cancelled':
      case 'failed':
        badgeStyle = 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
        break;
      case 'shipped':
        badgeStyle = 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300';
        break;
      default:
        badgeStyle = 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border border-transparent transition-colors ${badgeStyle}`}
    >
      {displayLabel}
    </span>
  );
};
