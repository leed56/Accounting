'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard, SummaryCard } from '@/components/metric-card';
import { TransactionCard } from '@/components/transaction-card';
import { InsightCard } from '@/components/insight-card';
import { ExpenseCategoryChart, ChartCard } from '@/components/charts';
import { EmptyState } from '@/components/empty-state';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import {
  getDashboardSummary,
  getTransactions,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';

export default function FinancePage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: summary } = useQuery({
    queryKey: queryKeys.dashboard(companyId, 'monthly'),
    queryFn: () => getDashboardSummary(companyId),
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId),
    queryFn: () => getTransactions(companyId, { limit: 10 }),
  });

  return (
    <AppShell title={t('finance')}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/income/add">
            <PremiumButton>
              <Plus className="h-4 w-4" />
              {t('addIncome')}
            </PremiumButton>
          </Link>
          <Link href="/expenses/add">
            <PremiumButton variant="secondary">
              <Plus className="h-4 w-4" />
              {t('addExpense')}
            </PremiumButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label={t('monthlyIncome')} value={formatCurrency(summary?.todayIncome ?? 0)} variant="income" />
          <MetricCard label={t('monthlyExpenses')} value={formatCurrency(summary?.todayExpenses ?? 0)} variant="expense" />
          <MetricCard label={t('netProfit')} value={formatCurrency(summary?.netProfit ?? 0)} variant="profit" />
          <MetricCard label={t('cashBalance')} value={formatCurrency(summary?.cashBalance ?? 0)} />
        </div>

        <InsightCard
          title={t('aiInsight')}
          message="Your expenses are 14% higher than last month, mainly due to fuel and maintenance."
          severity="warning"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t('expenseByCategory')}>
            <ExpenseCategoryChart />
          </ChartCard>
          <SummaryCard title="Recent Transactions">
            {transactions?.length ? (
              transactions.map((tx) => <TransactionCard key={tx.id} transaction={tx} />)
            ) : (
              <EmptyState icon={<Receipt className="h-8 w-8" />} title={t('noTransactions')} description={t('noTransactionsDesc')} />
            )}
          </SummaryCard>
        </div>
      </div>
    </AppShell>
  );
}
