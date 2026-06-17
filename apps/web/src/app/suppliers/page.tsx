'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getSuppliers, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { Truck, Plus } from 'lucide-react';

export default function SuppliersPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: suppliers } = useQuery({
    queryKey: queryKeys.suppliers(companyId),
    queryFn: () => getSuppliers(companyId),
  });

  const totalPayable = suppliers?.reduce((s, c) => s + c.current_balance, 0) ?? 0;

  return (
    <AppShell title={t('suppliers')}>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <MetricCard label={t('moneyToPay')} value={formatCurrency(totalPayable)} variant="expense" className="max-w-xs" />
          <PremiumButton><Plus className="h-4 w-4" />{t('addSupplier')}</PremiumButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers?.map((s) => (
            <div key={s.id} className="card">
              <h3 className="font-semibold text-gray-900">{s.name}</h3>
              <p className="text-2xl font-bold text-expense mt-2">{formatCurrency(s.current_balance)}</p>
              {s.phone && <p className="text-sm text-gray-500 mt-2">{s.phone}</p>}
            </div>
          ))}
        </div>
        {!suppliers?.length && (
          <EmptyState icon={<Truck className="h-8 w-8" />} title={t('noSuppliers')} description={t('noSuppliersDesc')} />
        )}
      </div>
    </AppShell>
  );
}
