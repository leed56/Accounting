'use client';

import { Menu, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { LanguageSwitcher, useTranslation } from './language-switcher';
import { PeriodToggle } from './period-toggle';
import { NotificationsPanel } from './notifications-panel';
import { GlobalSearch } from './global-search';
import Link from 'next/link';
import { useAuth } from './auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { getCompany, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useQuery } from '@tanstack/react-query';

export function TopBar({
  title,
  showPeriod = false,
}: {
  title?: string;
  showPeriod?: boolean;
}) {
  const { toggleSidebar, period, setPeriod, companyId } = useAppStore();
  const { profile, signOut } = useAuth();
  const { canWrite } = usePermissions();
  const { t } = useTranslation();

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId ?? SAMPLE_COMPANY_ID),
    queryFn: () => getCompany(companyId ?? SAMPLE_COMPANY_ID),
    enabled: !!companyId,
  });

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BM';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-border dark:border-gray-800">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 lg:flex-none">
            {title}
          </h1>
        )}

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {showPeriod && (
            <div className="hidden sm:block">
              <PeriodToggle value={period} onChange={setPeriod} />
            </div>
          )}
          <LanguageSwitcher compact />
          <NotificationsPanel />
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <button
              type="button"
              onClick={() => signOut()}
              className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm"
              title={t('logout')}
            >
              {initials}
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block max-w-[120px] truncate">
              {profile?.full_name ?? company?.name ?? 'BizManager'}
            </span>
          </div>
          {canWrite && (
            <Link
              href="/expenses/add"
              className="btn-primary hidden sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Add
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
