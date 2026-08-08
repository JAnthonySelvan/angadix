import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Breadcrumb = ({ items = [] }) => {
  const { t } = useTranslation();

  const allItems = [
    { label: t('nav.home', 'Home'), to: '/' },
    ...items,
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold overflow-x-auto py-2 pr-2 whitespace-nowrap scrollbar-none"
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight
                size={14}
                className="text-slate-400 shrink-0 rtl:rotate-180"
              />
            )}

            {isLast ? (
              <span
                className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.to ? (
              <Link
                to={item.to}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 shrink-0"
              >
                {index === 0 && <Home size={14} className="shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="text-slate-500 shrink-0">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
