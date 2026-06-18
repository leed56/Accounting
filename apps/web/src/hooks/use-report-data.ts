'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PeriodType } from '@bizmanager/types';
import {
  getExpenseCategories,
  getIncomeCategories,
  getTransactionsForPeriod,
  getAttendanceForRange,
  queryKeys,
} from '@bizmanager/supabase-client';
import {
  buildAttendanceTrend,
  buildCategoryBreakdown,
  buildIncomeExpenseTrend,
  getPeriodDateRange,
  summarizePeriodTransactions,
} from '@bizmanager/utils';
import type { Language } from '@bizmanager/i18n';
import { useTranslation } from '@/components/language-switcher';

export function useReportChartData(companyId: string, period: PeriodType) {
  const { language, t } = useTranslation();
  const { start, end } = getPeriodDateRange(period);

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: queryKeys.reports(companyId, 'transactions', period),
    queryFn: () => getTransactionsForPeriod(companyId, period),
  });

  const { data: expenseCategories } = useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getExpenseCategories(companyId),
  });

  const { data: incomeCategories } = useQuery({
    queryKey: queryKeys.incomeCategories(companyId),
    queryFn: () => getIncomeCategories(companyId),
  });

  const { data: attendance } = useQuery({
    queryKey: queryKeys.reports(companyId, 'attendance', period),
    queryFn: () => getAttendanceForRange(companyId, start, end),
  });

  return useMemo(() => {
    const txs = transactions ?? [];
    const lang = language as Language;
    const periodSummary = summarizePeriodTransactions(txs);

    return {
      isLoading: txLoading,
      periodSummary,
      incomeTrend: buildIncomeExpenseTrend(txs, period),
      expenseBreakdown: buildCategoryBreakdown(txs, expenseCategories ?? [], 'expense', lang),
      incomeBreakdown: buildCategoryBreakdown(txs, incomeCategories ?? [], 'income', lang),
      attendanceTrend: buildAttendanceTrend(attendance ?? []),
      emptyMessage: t('noReportData'),
      incomeLabel: t('income'),
      expenseLabel: t('expenses'),
      presentLabel: t('present'),
    };
  }, [
    transactions,
    expenseCategories,
    incomeCategories,
    attendance,
    period,
    language,
    txLoading,
    t,
  ]);
}
