'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getBankReconciliations, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { Landmark, Plus } from 'lucide-react';

export default function BankReconciliationPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: recons } = useQuery({
    queryKey: queryKeys.bankReconciliations(companyId),
    queryFn: () => getBankReconciliations(companyId),
  });

  return (
    <AppShell title={t('bankReconciliation')}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/bank-reconciliation/add">
            <PremiumButton><Plus className="h-4 w-4" />{t('newReconciliation')}</PremiumButton>
          </Link>
        </div>
        <div className="space-y-3">
          {recons?.map((r) => (
            <Link key={r.id} href={`/bank-reconciliation/${r.id}`} className="card block hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{r.statement_date}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(r.opening_balance)} → {formatCurrency(r.closing_balance)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                  {r.status}
                </span>
              </div>
            </Link>
          ))}
          {!recons?.length && (
            <div className="text-center py-12 text-gray-500">
              <Landmark className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>{t('noReconciliations')}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
