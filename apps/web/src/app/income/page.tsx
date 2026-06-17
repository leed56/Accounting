'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard, SummaryCard } from '@/components/metric-card';
import { TransactionCard } from '@/components/transaction-card';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getTransactions, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function IncomePage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId, { type: 'income' }),
    queryFn: () => getTransactions(companyId, { type: 'income' }),
  });

  const total = transactions?.reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <AppShell title={t('income')}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <MetricCard label={t('monthlyIncome')} value={formatCurrency(total)} variant="income" className="flex-1 max-w-xs" />
          <Link href="/income/add">
            <PremiumButton><Plus className="h-4 w-4" />{t('addIncome')}</PremiumButton>
          </Link>
        </div>
        <SummaryCard title={t('income')}>
          {transactions?.filter((t) => t.type === 'income').map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </SummaryCard>
      </div>
    </AppShell>
  );
}
