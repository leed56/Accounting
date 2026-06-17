'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Truck, Receipt, UserCircle } from 'lucide-react';
import { globalSearch, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from './language-switcher';
import { cn } from '@/lib/utils';

const typeIcons = {
  customer: Users,
  supplier: Truck,
  transaction: Receipt,
  staff: UserCircle,
};

export function GlobalSearch() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: queryKeys.search(companyId, debounced),
    queryFn: () => globalSearch(companyId, debounced),
    enabled: debounced.length >= 2,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const showDropdown = open && debounced.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('searchPlaceholder')}
        className="input-field pl-10 py-2"
        aria-label={t('searchPlaceholder')}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      />

      {showDropdown && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-border dark:border-gray-700 rounded-lg shadow-elevated z-50 max-h-80 overflow-y-auto"
        >
          {isFetching && (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t('searching')}</p>
          )}
          {!isFetching && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t('noSearchResults')}</p>
          )}
          {results.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                role="option"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-border/50 dark:border-gray-800 last:border-0'
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-primary-light dark:bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary dark:text-primary-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-gray-400 capitalize shrink-0">{item.type}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
