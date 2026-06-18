'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard, SummaryCard } from '@/components/metric-card';
import {
  IncomeExpenseChart,
  ExpenseCategoryChart,
  IncomeCategoryChart,
  AttendanceBarChart,
  ChartCard,
  CategoryBreakdownList,
} from '@/components/charts';
import { PremiumButton } from '@/components/premium-button';
import { PeriodToggle } from '@/components/period-toggle';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import { useReportChartData } from '@/hooks/use-report-data';
import {
  getCustomers,
  getSuppliers,
  getCompany,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { downloadReportPdf } from '@/lib/export/report-pdf';
import { downloadReportCsv, buildReportWhatsAppSummary } from '@/lib/export/report-csv';
import { openWhatsAppShare } from '@/lib/export/download';

export default function ReportsPage() {
  const { t, language } = useTranslation();
  const toast = useToast((s) => s.show);
  const { period, setPeriod, companyId: storeCompanyId } = useAppStore();
  const companyId = storeCompanyId ?? SAMPLE_COMPANY_ID;

  const {
    periodSummary,
    incomeTrend,
    expenseBreakdown,
    incomeBreakdown,
    attendanceTrend,
    emptyMessage,
    incomeLabel,
    expenseLabel,
    presentLabel,
  } = useReportChartData(companyId, period);

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers(companyId),
    queryFn: () => getCustomers(companyId),
  });

  const { data: suppliers } = useQuery({
    queryKey: queryKeys.suppliers(companyId),
    queryFn: () => getSuppliers(companyId),
  });

  const periodLabel = period === 'daily' ? t('daily') : period === 'weekly' ? t('weekly') : t('monthly');

  const exportData =
    customers && suppliers
      ? {
          companyName: company?.name ?? 'BizManager',
          periodLabel,
          language,
          summary: {
            todayIncome: periodSummary.income,
            todayExpenses: periodSummary.expenses,
            netProfit: periodSummary.netProfit,
            cashBalance: 0,
            bankBalance: 0,
            staffPresent: 0,
            staffTotal: 0,
            pendingApprovals: 0,
            pendingApprovalAmount: 0,
            pendingLeave: 0,
            receivables: customers.reduce((s, c) => s + Number(c.current_balance), 0),
            payables: suppliers.reduce((s, s2) => s + Number(s2.current_balance), 0),
          },
          customers,
          suppliers,
          expenseBreakdown,
          incomeBreakdown,
        }
      : null;

  const handlePdf = () => {
    if (!exportData) {
      toast(t('loading'), 'error');
      return;
    }
    downloadReportPdf(exportData);
  };

  const handleCsv = () => {
    if (!exportData) {
      toast(t('loading'), 'error');
      return;
    }
    downloadReportCsv(exportData);
  };

  const handleWhatsApp = () => {
    if (!exportData) {
      toast(t('loading'), 'error');
      return;
    }
    openWhatsAppShare(buildReportWhatsAppSummary(exportData));
  };

  return (
    <AppShell title={t('reports')}>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between gap-4">
          <PeriodToggle value={period} onChange={setPeriod} />
          <div className="flex flex-wrap gap-2">
            <PremiumButton variant="secondary" onClick={handlePdf}>{t('exportPdf')}</PremiumButton>
            <PremiumButton variant="secondary" onClick={handleCsv}>{t('exportExcel')}</PremiumButton>
            <PremiumButton variant="secondary" onClick={handleWhatsApp}>WhatsApp</PremiumButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard label={t('income')} value={formatCurrency(periodSummary.income)} variant="income" />
          <MetricCard label={t('expenses')} value={formatCurrency(periodSummary.expenses)} variant="expense" />
          <MetricCard label={t('netProfit')} value={formatCurrency(periodSummary.netProfit)} variant="profit" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t('incomeVsExpenses')}>
            <IncomeExpenseChart
              data={incomeTrend}
              incomeLabel={incomeLabel}
              expenseLabel={expenseLabel}
              emptyMessage={emptyMessage}
            />
          </ChartCard>
          <ChartCard title={t('expenseByCategory')}>
            <ExpenseCategoryChart data={expenseBreakdown} emptyMessage={emptyMessage} />
          </ChartCard>
          <ChartCard title={t('incomeByCategory')}>
            <IncomeCategoryChart data={incomeBreakdown} emptyMessage={emptyMessage} />
          </ChartCard>
          <ChartCard title={t('staffAttendanceReport')}>
            <AttendanceBarChart data={attendanceTrend} presentLabel={presentLabel} emptyMessage={emptyMessage} />
          </ChartCard>
          <SummaryCard title={t('expenseByCategory')}>
            <CategoryBreakdownList items={expenseBreakdown} emptyMessage={emptyMessage} />
          </SummaryCard>
          <SummaryCard title={t('incomeByCategory')}>
            <CategoryBreakdownList items={incomeBreakdown} emptyMessage={emptyMessage} />
          </SummaryCard>
          <SummaryCard title={t('receivables')}>
            {customers?.map((c) => (
              <div key={c.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span>{c.name}</span>
                <span className="font-semibold text-income">{formatCurrency(c.current_balance)}</span>
              </div>
            ))}
          </SummaryCard>
          <SummaryCard title={t('payables')}>
            {suppliers?.map((s) => (
              <div key={s.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span>{s.name}</span>
                <span className="font-semibold text-expense">{formatCurrency(s.current_balance)}</span>
              </div>
            ))}
          </SummaryCard>
        </div>
      </div>
    </AppShell>
  );
}
