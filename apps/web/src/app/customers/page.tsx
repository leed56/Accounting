'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getCustomers, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { Users, Plus, Pencil } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers(companyId),
    queryFn: () => getCustomers(companyId),
  });

  const totalReceivable = customers?.reduce((s, c) => s + c.current_balance, 0) ?? 0;

  return (
    <AppShell title={t('customers')}>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <MetricCard label={t('moneyToReceive')} value={formatCurrency(totalReceivable)} variant="income" className="max-w-xs" />
          <Link href="/customers/add">
            <PremiumButton><Plus className="h-4 w-4" />{t('addCustomer')}</PremiumButton>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers?.map((c) => (
            <div key={c.id} className="card">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <Link href={`/customers/${c.id}/edit`} className="text-primary hover:text-primary-dark">
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-2xl font-bold text-income mt-2">{formatCurrency(c.current_balance)}</p>
              {c.phone && <p className="text-sm text-gray-500 mt-2">{c.phone}</p>}
              {c.current_balance > 50000 && (
                <span className="inline-block mt-2 text-xs font-medium text-warning bg-warning-light px-2 py-0.5 rounded-full">Overdue</span>
              )}
            </div>
          ))}
        </div>
        {!customers?.length && (
          <EmptyState icon={<Users className="h-8 w-8" />} title={t('noCustomers')} description={t('noCustomersDesc')} action={<Link href="/customers/add"><PremiumButton>{t('addCustomer')}</PremiumButton></Link>} />
        )}
      </div>
    </AppShell>
  );
}
