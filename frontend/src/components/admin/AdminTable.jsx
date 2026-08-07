import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const AdminTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available.',
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  idKey = '_id',
}) => {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
      {/* Desktop View (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              {selectable && (
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  {selectable && (
                    <td className="p-4">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="p-4">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rIdx) => {
                const rowId = row[idKey] || rIdx;
                const isSelected = selectedIds.includes(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'bg-primary-50/50 dark:bg-primary-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {selectable && (
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow?.(rowId, e.target.checked)}
                          className="rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`p-4 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                        }`}
                      >
                        {col.render ? col.render(row, rIdx) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-8 text-center text-slate-400 font-semibold"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-4 space-y-2">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/3 rounded" />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((row, rIdx) => {
            const rowId = row[idKey] || rIdx;
            const isSelected = selectedIds.includes(rowId);
            return (
              <div
                key={rowId}
                onClick={() => onRowClick?.(row)}
                className={`p-4 space-y-2 text-xs transition-colors ${
                  isSelected
                    ? 'bg-primary-50/50 dark:bg-primary-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {selectable && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400">Select Row</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectRow?.(rowId, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                )}
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between items-center gap-2">
                    <span className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wide flex-shrink-0">
                      {col.label}:
                    </span>
                    <div className="text-right text-slate-900 dark:text-white font-medium min-w-0">
                      {col.render ? col.render(row, rIdx) : row[col.key] ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 font-semibold">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};
