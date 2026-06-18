'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { InsightCard } from '@/components/insight-card';
import { SummaryCard } from '@/components/metric-card';
import { TransactionCard } from '@/components/transaction-card';
import { ApprovalCard } from '@/components/approval-card';
import { DashboardSkeleton } from '@/components/empty-state';
import { IncomeExpenseChart, ChartCard } from '@/components/charts';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { usePermissions } from '@/hooks/use-permissions';
import { useReportChartData } from '@/hooks/use-report-data';
import { WelcomeHero } from '@/components/welcome-hero';
import {
  getDashboardSummary,
  getTransactions,
  getPaymentRequests,
  getCompany,
  getExpenseCategories,
  getIncomeCategories,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { getDailyInsight } from '@bizmanager/ai';
import { formatCurrency, resolveTransactionCategoryLabel } from '@bizmanager/utils';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Users,
  CheckSquare,
} from 'lucide-react';

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const { isReadOnly } = usePermissions();
  const period = useAppStore((s) => s.period);
  const { incomeTrend, emptyMessage, incomeLabel, expenseLabel } = useReportChartData(companyId, period);

  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(companyId, 'daily'),
    queryFn: () => getDashboardSummary(companyId),
  });

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId, { limit: '5' }),
    queryFn: () => getTransactions(companyId, { limit: 5 }),
  });

  const { data: expenseCategories } = useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getExpenseCategories(companyId),
  });

  const { data: incomeCategories } = useQuery({
    queryKey: queryKeys.incomeCategories(companyId),
    queryFn: () => getIncomeCategories(companyId),
  });

  const { data: approvals } = useQuery({
    queryKey: queryKeys.paymentRequests(companyId, 'pending'),
    queryFn: () => getPaymentRequests(companyId, 'pending'),
  });

  const { data: aiInsight } = useQuery({
    queryKey: ['ai-daily', companyId, language],
    queryFn: () => getDailyInsight(companyId, language),
  });

  if (isLoading || !summary) {
    return (
      <AppShell title={t('dashboard')} showPeriod>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell title={t('dashboard')} showPeriod>
      <div className="space-y-6">
        {isReadOnly && (
          <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
            {t('readOnlyBanner')}
          </p>
        )}
        <WelcomeHero
          companyName={company?.name ?? 'BizManager'}
          ownerName={company?.owner_name}
          pendingApprovals={summary.pendingApprovals}
          readOnly={isReadOnly}
        />

        {aiInsight && (
          <InsightCard
            title={aiInsight.title}
            message={aiInsight.message}
            severity={aiInsight.severity === 'critical' ? 'critical' : aiInsight.severity === 'warning' ? 'warning' : 'info'}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label={t('todayIncome')}
            value={formatCurrency(summary.todayIncome)}
            variant="income"
            icon={<TrendingUp className="h-5 w-5 text-income" />}
          />
          <MetricCard
            label={t('todayExpenses')}
            value={formatCurrency(summary.todayExpenses)}
            variant="expense"
            icon={<TrendingDown className="h-5 w-5 text-expense" />}
          />
          <MetricCard
            label={t('netProfit')}
            value={formatCurrency(summary.netProfit)}
            variant="profit"
          />
          <MetricCard
            label={t('cashBalance')}
            value={formatCurrency(summary.cashBalance)}
            icon={<Wallet className="h-5 w-5 text-gray-400" />}
          />
          <MetricCard
            label={t('bankBalance')}
            value={formatCurrency(summary.bankBalance)}
            icon={<Building2 className="h-5 w-5 text-gray-400" />}
          />
          <MetricCard
            label={t('staffPresent')}
            value={`${summary.staffPresent}/${summary.staffTotal}`}
            variant="default"
            icon={<Users className="h-5 w-5 text-gray-400" />}
          />
          <MetricCard
            label={t('pendingApprovals')}
            value={String(summary.pendingApprovals)}
            variant="warning"
            trend={formatCurrency(summary.pendingApprovalAmount)}
            icon={<CheckSquare className="h-5 w-5 text-warning" />}
          />
          <MetricCard
            label={t('moneyToReceive')}
            value={formatCurrency(summary.receivables)}
            variant="income"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title={t('incomeVsExpenses')}>
              <IncomeExpenseChart
                data={incomeTrend}
                incomeLabel={incomeLabel}
                expenseLabel={expenseLabel}
                emptyMessage={emptyMessage}
              />
            </ChartCard>
          </div>
          <SummaryCard title={t('pendingApprovals')}>
            <div className="space-y-3">
              {approvals?.slice(0, 3).map((a) => (
                <ApprovalCard key={a.id} request={a} />
              ))}
              <Link href="/approvals" className="text-sm text-primary font-medium">
                View all →
              </Link>
            </div>
          </SummaryCard>
        </div>

        <SummaryCard title={t('recentActivity')}>
          {transactions?.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              categoryLabel={resolveTransactionCategoryLabel(
                tx,
                expenseCategories ?? [],
                incomeCategories ?? [],
                language
              )}
            />
          ))}
        </SummaryCard>
      </div>
    </AppShell>
  );
}
