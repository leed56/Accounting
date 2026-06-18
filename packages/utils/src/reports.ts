import type { Language } from '@bizmanager/i18n';
import type { PeriodType, Transaction } from '@bizmanager/types';
import { getCategoryName } from './category';
import { toISODate } from './date';

export type CategoryChartItem = {
  name_en: string;
  label: string;
  value: number;
  color: string;
};

export type TrendChartItem = {
  name: string;
  income: number;
  expense: number;
};

type CategoryMeta = {
  name_en: string;
  name_si?: string | null;
  name_ta?: string | null;
  color?: string | null;
};

const DEFAULT_COLOR = '#9CA3AF';

export function getPeriodDateRange(period: PeriodType, refDate: Date = new Date()): { start: string; end: string } {
  const end = toISODate(refDate);
  if (period === 'daily') {
    return { start: end, end };
  }
  if (period === 'weekly') {
    const startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() - 6);
    return { start: toISODate(startDate), end };
  }
  const year = refDate.getFullYear();
  const month = refDate.getMonth() + 1;
  return { start: `${year}-${String(month).padStart(2, '0')}-01`, end };
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: PeriodType,
  refDate: Date = new Date()
): Transaction[] {
  const { start, end } = getPeriodDateRange(period, refDate);
  return transactions.filter((tx) => tx.transaction_date >= start && tx.transaction_date <= end);
}

export function isApprovedTransaction(tx: Transaction): boolean {
  if (tx.type === 'income') return tx.status === 'approved';
  return tx.status === 'approved' || tx.status === 'paid';
}

export function summarizePeriodTransactions(transactions: Transaction[]) {
  const approved = transactions.filter(isApprovedTransaction);
  const income = approved
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const expenses = approved
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  return { income, expenses, netProfit: income - expenses };
}

export function buildCategoryBreakdown(
  transactions: Transaction[],
  categories: CategoryMeta[],
  type: 'income' | 'expense',
  lang: Language
): CategoryChartItem[] {
  const filtered = transactions.filter((tx) => tx.type === type && isApprovedTransaction(tx));
  const totals = new Map<string, number>();

  for (const tx of filtered) {
    const key = tx.category?.trim() || 'Other';
    totals.set(key, (totals.get(key) ?? 0) + Number(tx.amount));
  }

  const categoryByName = new Map(categories.map((c) => [c.name_en, c]));
  const items: CategoryChartItem[] = [];

  for (const cat of categories) {
    const value = totals.get(cat.name_en) ?? 0;
    if (value > 0) {
      items.push({
        name_en: cat.name_en,
        label: getCategoryName(cat, lang),
        value,
        color: cat.color ?? DEFAULT_COLOR,
      });
    }
    totals.delete(cat.name_en);
  }

  for (const [name_en, value] of totals) {
    if (value <= 0) continue;
    const meta = categoryByName.get(name_en);
    items.push({
      name_en,
      label: meta ? getCategoryName(meta, lang) : name_en,
      value,
      color: meta?.color ?? DEFAULT_COLOR,
    });
  }

  return items.sort((a, b) => b.value - a.value);
}

export function resolveTransactionCategoryLabel(
  tx: Transaction,
  expenseCategories: CategoryMeta[],
  incomeCategories: CategoryMeta[],
  lang: Language
): string | null {
  if (!tx.category) return null;
  const pool = tx.type === 'income' ? incomeCategories : expenseCategories;
  const match = pool.find((c) => c.name_en === tx.category);
  return match ? getCategoryName(match, lang) : tx.category;
}

export function buildIncomeExpenseTrend(
  transactions: Transaction[],
  period: PeriodType,
  refDate: Date = new Date()
): TrendChartItem[] {
  const approved = transactions.filter(isApprovedTransaction);

  if (period === 'daily') {
    const items: TrendChartItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      const day = toISODate(d);
      const dayLabel = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(d);
      const dayTxs = approved.filter((tx) => tx.transaction_date === day);
      items.push({
        name: dayLabel,
        income: dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
        expense: dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      });
    }
    return items;
  }

  if (period === 'weekly') {
    const items: TrendChartItem[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(refDate);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const ws = toISODate(weekStart);
      const we = toISODate(weekEnd);
      const weekTxs = approved.filter((tx) => tx.transaction_date >= ws && tx.transaction_date <= we);
      items.push({
        name: `W${4 - w}`,
        income: weekTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
        expense: weekTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      });
    }
    return items;
  }

  const { start, end } = getPeriodDateRange(period, refDate);
  const monthStart = new Date(start);
  const monthEnd = new Date(end);
  const items: TrendChartItem[] = [];
  let weekIndex = 1;
  let cursor = new Date(monthStart);

  while (cursor <= monthEnd) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > monthEnd) weekEnd.setTime(monthEnd.getTime());
    const ws = toISODate(weekStart);
    const we = toISODate(weekEnd);
    const weekTxs = approved.filter((tx) => tx.transaction_date >= ws && tx.transaction_date <= we);
    items.push({
      name: `W${weekIndex}`,
      income: weekTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expense: weekTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    });
    weekIndex += 1;
    cursor.setDate(cursor.getDate() + 7);
  }

  return items;
}

export type AttendanceChartItem = { day: string; present: number };

export function buildAttendanceTrend(
  records: { date: string; status: string }[],
  refDate: Date = new Date()
): AttendanceChartItem[] {
  const items: AttendanceChartItem[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const day = toISODate(d);
    const dayLabel = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(d);
    const present = records.filter((r) => r.date === day && r.status === 'present').length;
    items.push({ day: dayLabel, present });
  }
  return items;
}
