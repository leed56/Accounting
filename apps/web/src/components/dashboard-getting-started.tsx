'use client';

import Link from 'next/link';
import { useTranslation } from './language-switcher';
import { PremiumButton } from './premium-button';
import { EmptyState } from './empty-state';
import { Users, TrendingUp, TrendingDown, Store } from 'lucide-react';

interface DashboardGettingStartedProps {
  isMultiVendor?: boolean;
  vendorCount?: number;
}

export function DashboardGettingStarted({
  isMultiVendor = false,
  vendorCount = 0,
}: DashboardGettingStartedProps) {
  const { t } = useTranslation();

  if (isMultiVendor) {
    return (
      <EmptyState
        icon={<Store className="h-8 w-8" />}
        title={t('dashboardEmptyMultiVendor')}
        description={t('dashboardEmptyMultiVendorDesc')}
        action={
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center">
            {vendorCount === 0 && (
              <Link href="/suppliers/add">
                <PremiumButton>
                  <Users className="h-4 w-4" />
                  {t('addFirstVendor')}
                </PremiumButton>
              </Link>
            )}
            <Link href="/income/add?category=Vendor%20Commission">
              <PremiumButton variant="secondary">
                <TrendingUp className="h-4 w-4" />
                {t('recordCommission')}
              </PremiumButton>
            </Link>
            <Link href="/expenses/add?category=Vendor%20Settlements">
              <PremiumButton variant="secondary">
                <TrendingDown className="h-4 w-4" />
                {t('recordVendorSettlement')}
              </PremiumButton>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<TrendingUp className="h-8 w-8" />}
      title={t('dashboardEmptyTitle')}
      description={t('dashboardEmptyDesc')}
      action={
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/income/add">
            <PremiumButton>
              <TrendingUp className="h-4 w-4" />
              {t('addIncome')}
            </PremiumButton>
          </Link>
          <Link href="/expenses/add">
            <PremiumButton variant="secondary">
              <TrendingDown className="h-4 w-4" />
              {t('addExpense')}
            </PremiumButton>
          </Link>
        </div>
      }
    />
  );
}
