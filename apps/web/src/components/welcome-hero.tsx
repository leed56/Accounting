'use client';

import Link from 'next/link';
import { useTranslation } from './language-switcher';
import { getTimeGreeting } from '@bizmanager/utils';
import { Plus, TrendingUp, TrendingDown, CheckSquare } from 'lucide-react';

interface WelcomeHeroProps {
  companyName: string;
  ownerName?: string | null;
  pendingApprovals?: number;
  readOnly?: boolean;
}

export function WelcomeHero({ companyName, ownerName, pendingApprovals = 0, readOnly = false }: WelcomeHeroProps) {
  const { t } = useTranslation();
  const greetingKey = getTimeGreeting();
  const greeting =
    greetingKey === 'morning'
      ? t('goodMorning')
      : greetingKey === 'afternoon'
        ? t('goodAfternoon')
        : t('goodEvening');
  const name = ownerName?.split(' ')[0] ?? companyName;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark text-white p-6 md:p-8 shadow-elevated">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      <div className="relative">
        <p className="text-primary-light/90 text-sm font-medium">{companyName}</p>
        <h2 className="text-2xl md:text-3xl font-bold mt-1">
          {greeting}, {name}
        </h2>
        <p className="text-white/80 text-sm mt-2 max-w-lg">{t('tagline')}</p>

        {pendingApprovals > 0 && (
          <p className="mt-3 text-sm bg-white/15 inline-block px-3 py-1 rounded-full">
            {pendingApprovals} {t('pendingApprovals').toLowerCase()}
          </p>
        )}

        {!readOnly && (
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href="/income/add" className="inline-flex items-center gap-2 bg-white text-primary font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-white/90 transition-colors min-h-[44px]">
              <TrendingUp className="h-4 w-4" />
              {t('addIncome')}
            </Link>
            <Link href="/expenses/add" className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-white/25 transition-colors border border-white/20 min-h-[44px]">
              <TrendingDown className="h-4 w-4" />
              {t('addExpense')}
            </Link>
            {pendingApprovals > 0 && (
              <Link href="/approvals" className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-white/25 transition-colors border border-white/20 min-h-[44px]">
                <CheckSquare className="h-4 w-4" />
                {t('approvals')}
              </Link>
            )}
            <Link href="/expenses/add" className="inline-flex items-center gap-2 bg-white/10 text-white/90 font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] sm:hidden">
              <Plus className="h-4 w-4" />
              {t('add')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
