import type { Customer, DashboardSummary, Supplier, Transaction } from '@bizmanager/types';
import { formatCurrency } from '@bizmanager/utils';
import { downloadBlob } from './download';

export interface ReportExportData {
  companyName: string;
  periodLabel: string;
  summary: DashboardSummary;
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

function escapeCsv(value: string | number) {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function downloadReportCsv(data: ReportExportData) {
  const { companyName, periodLabel, summary, customers, suppliers, transactions } = data;
  const lines: string[] = [];

  lines.push('BizManager Business Report');
  lines.push(`${escapeCsv(companyName)},${escapeCsv(periodLabel)}`);
  lines.push('');
  lines.push('Metric,Amount (LKR)');
  lines.push(`Income,${summary.todayIncome}`);
  lines.push(`Expenses,${summary.todayExpenses}`);
  lines.push(`Net Profit,${summary.netProfit}`);
  lines.push(`Cash Balance,${summary.cashBalance}`);
  lines.push(`Receivables,${summary.receivables}`);
  lines.push(`Payables,${summary.payables}`);
  lines.push('');
  lines.push('Date,Type,Category,Description,Amount,Status');
  for (const tx of transactions) {
    lines.push(
      [
        tx.transaction_date,
        tx.type,
        tx.category ?? '',
        tx.description ?? '',
        tx.amount,
        tx.status,
      ].map(escapeCsv).join(',')
    );
  }
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
  const { companyName, periodLabel, summary } = data;
  return [
    `${companyName} — ${periodLabel} Summary`,
    `Income: ${formatCurrency(summary.todayIncome)}`,
    `Expenses: ${formatCurrency(summary.todayExpenses)}`,
    `Net Profit: ${formatCurrency(summary.netProfit)}`,
    `Cash: ${formatCurrency(summary.cashBalance)}`,
    `Receivables: ${formatCurrency(summary.receivables)}`,
    `Payables: ${formatCurrency(summary.payables)}`,
    '',
    'BizManager',
  ].join('\n');
}
