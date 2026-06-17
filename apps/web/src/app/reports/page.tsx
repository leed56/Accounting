'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard, SummaryCard } from '@/components/metric-card';
import { IncomeExpenseChart, ExpenseCategoryChart, AttendanceBarChart, ChartCard } from '@/components/charts';
import { PremiumButton } from '@/components/premium-button';
import { PeriodToggle } from '@/components/period-toggle';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import {
  getDashboardSummary,
  getCustomers,
  getSuppliers,
  getTransactions,
  getCompany,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { downloadReportPdf } from '@/lib/export/report-pdf';
import { downloadReportCsv, buildReportWhatsAppSummary } from '@/lib/export/report-csv';
import { openWhatsAppShare } from '@/lib/export/download';

export default function ReportsPage() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const { period, setPeriod, companyId: storeCompanyId } = useAppStore();
  const companyId = storeCompanyId ?? SAMPLE_COMPANY_ID;

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const { data: summary } = useQuery({
    queryKey: queryKeys.dashboard(companyId, period),
    queryFn: () => getDashboardSummary(companyId),
  });

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers(companyId),
    queryFn: () => getCustomers(companyId),
  });

  const { data: suppliers } = useQuery({
    queryKey: queryKeys.suppliers(companyId),
    queryFn: () => getSuppliers(companyId),
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId),
    queryFn: () => getTransactions(companyId, { limit: 100 }),
  });

  const periodLabel = period === 'daily' ? t('daily') : period === 'weekly' ? t('weekly') : t('monthly');

  const exportData = summary && customers && suppliers && transactions ? {
    companyName: company?.name ?? 'BizManager',
    periodLabel,
    summary,
    customers,
    suppliers,
    transactions,
  } : null;

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
          <MetricCard label={t('todayIncome')} value={formatCurrency(summary?.todayIncome ?? 0)} variant="income" />
          <MetricCard label={t('todayExpenses')} value={formatCurrency(summary?.todayExpenses ?? 0)} variant="expense" />
          <MetricCard label={t('netProfit')} value={formatCurrency(summary?.netProfit ?? 0)} variant="profit" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t('incomeVsExpenses')}><IncomeExpenseChart /></ChartCard>
          <ChartCard title={t('expenseByCategory')}><ExpenseCategoryChart /></ChartCard>
          <ChartCard title={t('staffAttendanceReport')}><AttendanceBarChart /></ChartCard>
          <SummaryCard title={t('receivables')}>
            {customers?.map((c) => (
              <div key={c.id} className="flex justify-between py-2 border-b border-gray-100">
                <span>{c.name}</span>
                <span className="font-semibold text-income">{formatCurrency(c.current_balance)}</span>
              </div>
            ))}
          </SummaryCard>
          <SummaryCard title={t('payables')}>
            {suppliers?.map((s) => (
              <div key={s.id} className="flex justify-between py-2 border-b border-gray-100">
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
