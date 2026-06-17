'use client';

import { Menu, Search, Bell, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { LanguageSwitcher } from './language-switcher';
import { PeriodToggle } from './period-toggle';
import Link from 'next/link';

export function TopBar({
  title,
  showPeriod = false,
}: {
  title?: string;
  showPeriod?: boolean;
}) {
  const { toggleSidebar, period, setPeriod } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 lg:flex-none">
            {title}
          </h1>
        )}

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="input-field pl-10 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {showPeriod && (
            <div className="hidden sm:block">
              <PeriodToggle value={period} onChange={setPeriod} />
            </div>
          )}
          <LanguageSwitcher compact />
          <button className="relative p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">
              KP
            </div>
            <span className="text-sm font-medium text-gray-700 hidden lg:block">
              Kasun Perera
            </span>
          </div>
          <Link
            href="/expenses/add"
            className="btn-primary hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </div>
      </div>
    </header>
  );
}
