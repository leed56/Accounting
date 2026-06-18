import type { Customer, DashboardSummary, Supplier } from '@bizmanager/types';
import type { CategoryChartItem } from '@bizmanager/utils';
import { formatCurrency } from '@bizmanager/utils';
import type { Language } from '@bizmanager/i18n';
import { downloadBlob } from './download';

export interface ReportExportData {
  companyName: string;
  periodLabel: string;
  language?: Language;
  summary: DashboardSummary;
  customers: Customer[];
  suppliers: Supplier[];
  expenseBreakdown?: CategoryChartItem[];
  incomeBreakdown?: CategoryChartItem[];
}

function escapeCsv(value: string | number) {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function writeBreakdownSection(lines: string[], title: string, items?: CategoryChartItem[]) {
  if (!items?.length) return;
  lines.push('');
  lines.push(title);
  lines.push('Category,Amount (LKR)');
  for (const item of items) {
    lines.push(`${escapeCsv(item.label)},${item.value}`);
  }
}

export function downloadReportCsv(data: ReportExportData) {
  const { companyName, periodLabel, summary, customers, suppliers, expenseBreakdown, incomeBreakdown } = data;
  const lines: string[] = [];

  lines.push('BizManager Business Report');
  lines.push(`${escapeCsv(companyName)},${escapeCsv(periodLabel)}`);
  lines.push('');
  lines.push('Metric,Amount (LKR)');
  lines.push(`Income,${summary.todayIncome}`);
  lines.push(`Expenses,${summary.todayExpenses}`);
  lines.push(`Net Profit,${summary.netProfit}`);
  lines.push(`Receivables,${summary.receivables}`);
  lines.push(`Payables,${summary.payables}`);

  writeBreakdownSection(lines, 'Expenses by Category', expenseBreakdown);
  writeBreakdownSection(lines, 'Income by Category', incomeBreakdown);

  lines.push('');
  lines.push('Customer,Balance');
  for (const c of customers) {
    lines.push(`${escapeCsv(c.name)},${c.current_balance}`);
  }
  lines.push('');
  lines.push('Supplier,Balance');
  for (const s of suppliers) {
    lines.push(`${escapeCsv(s.name)},${s.current_balance}`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const filename = `report-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.csv`;
  downloadBlob(blob, filename);
}

export function buildReportWhatsAppSummary(data: ReportExportData): string {
  const { companyName, periodLabel, summary, expenseBreakdown, incomeBreakdown } = data;
  const topExpense = expenseBreakdown?.[0];
  const topIncome = incomeBreakdown?.[0];
  return [
    `${companyName} — ${periodLabel} Summary`,
    `Income: ${formatCurrency(summary.todayIncome)}`,
    `Expenses: ${formatCurrency(summary.todayExpenses)}`,
    `Net Profit: ${formatCurrency(summary.netProfit)}`,
    topExpense ? `Top expense: ${topExpense.label} (${formatCurrency(topExpense.value)})` : null,
    topIncome ? `Top income: ${topIncome.label} (${formatCurrency(topIncome.value)})` : null,
    `Receivables: ${formatCurrency(summary.receivables)}`,
    `Payables: ${formatCurrency(summary.payables)}`,
    '',
    'BizManager',
  ]
    .filter(Boolean)
    .join('\n');
}
