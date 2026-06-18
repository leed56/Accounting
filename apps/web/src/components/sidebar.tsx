'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from './language-switcher';
import { useQuery } from '@tanstack/react-query';
import { getCompany, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useBusinessLabels } from '@/hooks/use-business-labels';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Truck,
  ClipboardCheck,
  Calendar,
  Wallet,
  CheckSquare,
  BarChart3,
  Settings,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';

const mainNav = [
  { href: '/dashboard', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/income', labelKey: 'income' as const, icon: TrendingUp },
  { href: '/expenses', labelKey: 'expenses' as const, icon: TrendingDown },
  { href: '/cheques', labelKey: 'cheques' as const, icon: FileText },
  { href: '/customers', labelKey: 'customers' as const, icon: Users },
  { href: '/suppliers', labelKey: 'suppliers' as const, icon: Truck },
];

const staffNav = [
  { href: '/staff', labelKey: 'staff' as const, icon: Users },
  { href: '/attendance', labelKey: 'attendance' as const, icon: ClipboardCheck },
  { href: '/leave', labelKey: 'leave' as const, icon: Calendar },
  { href: '/payroll', labelKey: 'payroll' as const, icon: Wallet },
];

const otherNav = [
  { href: '/approvals', labelKey: 'approvals' as const, icon: CheckSquare },
  { href: '/ai', labelKey: 'ai' as const, icon: Sparkles },
  { href: '/reports', labelKey: 'reports' as const, icon: BarChart3 },
  { href: '/settings', labelKey: 'settings' as const, icon: Settings },
];

function NavSection({
  title,
  items,
  pathname,
  t,
  labelOverrides,
}: {
  title?: string;
  items: { href: string; labelKey: keyof typeof import('@bizmanager/i18n').en; icon: typeof LayoutDashboard }[];
  pathname: string;
  t: (key: keyof typeof import('@bizmanager/i18n').en) => string;
  labelOverrides?: Record<string, string>;
}) {
  return (
    <div className="mb-6">
      {title && (
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                active
                  ? 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {labelOverrides?.[item.href] ?? t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, companyId } = useAppStore();
  const { t } = useTranslation();

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId ?? SAMPLE_COMPANY_ID),
    queryFn: () => getCompany(companyId ?? SAMPLE_COMPANY_ID),
    enabled: !!companyId,
  });

  const { suppliersTitle } = useBusinessLabels();
  const navLabelOverrides = suppliersTitle !== t('suppliers')
    ? { '/suppliers': suppliersTitle }
    : undefined;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-border dark:border-gray-800 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-800">
          <div>
            <h1 className="text-lg font-bold text-primary">BizManager</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{company?.name ?? 'BizManager'}</p>
          </div>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavSection items={mainNav} pathname={pathname} t={t} labelOverrides={navLabelOverrides} />
          <NavSection title="Staff" items={staffNav} pathname={pathname} t={t} labelOverrides={navLabelOverrides} />
          <NavSection items={otherNav} pathname={pathname} t={t} labelOverrides={navLabelOverrides} />
        </div>
      </aside>
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const items = [
    { href: '/dashboard', labelKey: 'home' as const, icon: LayoutDashboard },
    { href: '/expenses', labelKey: 'finance' as const, icon: TrendingDown },
    { href: '/staff', labelKey: 'staff' as const, icon: Users },
    { href: '/approvals', labelKey: 'approvals' as const, icon: CheckSquare },
    { href: '/ai', labelKey: 'ai' as const, icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-border dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 min-w-[64px] min-h-[44px] justify-center',
                active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
