'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { InsightCard } from '@/components/insight-card';
import { SummaryCard } from '@/components/metric-card';
import { TransactionCard } from '@/components/transaction-card';
import { ApprovalCard } from '@/components/approval-card';
import { DashboardSkeleton } from '@/components/empty-state';
import { DashboardGettingStarted } from '@/components/dashboard-getting-started';
import { IncomeExpenseChart, ChartCard } from '@/components/charts';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { usePermissions } from '@/hooks/use-permissions';
import { useBusinessLabels } from '@/hooks/use-business-labels';
import { useReportChartData } from '@/hooks/use-report-data';
import { WelcomeHero } from '@/components/welcome-hero';
import {
  getDashboardSummary,
  getTransactions,
  getPaymentRequests,
  getExpenseCategories,
  getIncomeCategories,
  getBusinessTypeMetrics,
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
  Percent,
  Truck,
} from 'lucide-react';

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const { isReadOnly } = usePermissions();
  const { isMultiVendor, payablesLabel, company } = useBusinessLabels();
  const period = useAppStore((s) => s.period);
  const { incomeTrend, emptyMessage, incomeLabel, expenseLabel } = useReportChartData(companyId, period);

  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(companyId, 'daily'),
    queryFn: () => getDashboardSummary(companyId),
  });

  const { data: businessMetrics } = useQuery({
    queryKey: queryKeys.businessMetrics(companyId, company?.business_type ?? 'other'),
    queryFn: () => getBusinessTypeMetrics(companyId, company!.business_type),
    enabled: !!company && isMultiVendor,
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

  const showGettingStarted =
    isMultiVendor &&
    businessMetrics &&
    !businessMetrics.hasActivity &&
    (transactions?.length ?? 0) === 0;

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
          isMultiVendor={isMultiVendor}
        />

        {showGettingStarted ? (
          <DashboardGettingStarted
            isMultiVendor
            vendorCount={businessMetrics?.vendorCount ?? 0}
          />
        ) : (
          <>
            {aiInsight && (
              <InsightCard
                title={aiInsight.title}
                message={aiInsight.message}
                severity={
                  aiInsight.severity === 'critical'
                    ? 'critical'
                    : aiInsight.severity === 'warning'
                      ? 'warning'
                      : 'info'
                }
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr">
              {isMultiVendor && businessMetrics ? (
                <>
                  <MetricCard
                    className="h-full"
                    label={t('commissionThisMonth')}
                    value={formatCurrency(businessMetrics.commissionThisMonth)}
                    variant="income"
                    icon={<Percent className="h-5 w-5 text-income" />}
                  />
                  <MetricCard
                    className="h-full"
                    label={t('vendorSettlementsThisMonth')}
                    value={formatCurrency(businessMetrics.vendorSettlementsThisMonth)}
                    variant="expense"
                    icon={<TrendingDown className="h-5 w-5 text-expense" />}
                  />
                  <MetricCard
                    className="h-full"
                    label={payablesLabel}
                    value={formatCurrency(summary.payables)}
                    variant="expense"
                    icon={<Truck className="h-5 w-5 text-expense" />}
                  />
                  <MetricCard
                    className="h-full"
                    label={t('vendorCount')}
                    value={String(businessMetrics.vendorCount)}
                    icon={<Users className="h-5 w-5 text-gray-400" />}
                  />
                </>
              ) : null}

              <MetricCard
                className="h-full"
                label={t('todayIncome')}
                value={formatCurrency(summary.todayIncome)}
                variant="income"
                icon={<TrendingUp className="h-5 w-5 text-income" />}
              />
              <MetricCard
                className="h-full"
                label={t('todayExpenses')}
                value={formatCurrency(summary.todayExpenses)}
                variant="expense"
                icon={<TrendingDown className="h-5 w-5 text-expense" />}
              />
              <MetricCard
                className="h-full"
                label={t('netProfit')}
                value={formatCurrency(summary.netProfit)}
                variant="profit"
              />
              <MetricCard
                className="h-full"
                label={t('cashBalance')}
                value={formatCurrency(summary.cashBalance)}
                icon={<Wallet className="h-5 w-5 text-gray-400" />}
              />
              <MetricCard
                className="h-full"
                label={t('bankBalance')}
                value={formatCurrency(summary.bankBalance)}
                icon={<Building2 className="h-5 w-5 text-gray-400" />}
              />
              {!isMultiVendor && (
                <MetricCard
                  className="h-full"
                  label={t('staffPresent')}
                  value={`${summary.staffPresent}/${summary.staffTotal}`}
                  variant="default"
                  icon={<Users className="h-5 w-5 text-gray-400" />}
                />
              )}
              <MetricCard
                className="h-full"
                label={t('pendingApprovals')}
                value={String(summary.pendingApprovals)}
                variant="warning"
                trend={formatCurrency(summary.pendingApprovalAmount)}
                icon={<CheckSquare className="h-5 w-5 text-warning" />}
              />
              <MetricCard
                className="h-full"
                label={t('moneyToReceive')}
                value={formatCurrency(summary.receivables)}
                variant="income"
              />
              {!isMultiVendor && (
                <MetricCard
                  className="h-full"
                  label={t('moneyToPay')}
                  value={formatCurrency(summary.payables)}
                  variant="expense"
                />
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
              <div className="xl:col-span-2 h-full">
                <ChartCard title={t('incomeVsExpenses')}>
                  <IncomeExpenseChart
                    data={incomeTrend}
                    incomeLabel={incomeLabel}
                    expenseLabel={expenseLabel}
                    emptyMessage={emptyMessage}
                  />
                </ChartCard>
              </div>
              <SummaryCard className="xl:col-span-2 h-full" title={t('pendingApprovals')}>
                <div className="space-y-3">
                  {approvals?.slice(0, 3).map((a) => (
                    <ApprovalCard key={a.id} request={a} />
                  ))}
                  {!approvals?.length && (
                    <p className="text-sm text-gray-500">{t('noPendingApprovals')}</p>
                  )}
                  <Link href="/approvals" className="text-sm text-primary font-medium">
                    View all →
                  </Link>
                </div>
              </SummaryCard>
            </div>

            <SummaryCard title={t('recentActivity')}>
              {transactions?.length ? (
                transactions.map((tx) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4">{t('noRecentActivity')}</p>
              )}
            </SummaryCard>
          </>
        )}
      </div>
    </AppShell>
  );
}
