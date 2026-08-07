import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export const AdminSearchBar = ({
  placeholder = 'Search records...',
  value = '',
  onChange,
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange?.(val);
    }, 300);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange?.('');
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-wrap items-center gap-3">
      {/* Debounced Search Field */}
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 text-slate-800 dark:text-slate-100 outline-none transition-all font-medium"
        />
        <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Slots */}
      {children}
    </div>
  );
};
