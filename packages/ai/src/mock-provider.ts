import type { Language } from '@bizmanager/i18n';
import type { DashboardSummary } from '@bizmanager/types';
import { formatCurrency } from '@bizmanager/utils';
import { calculateRiskLevel } from '@bizmanager/utils';
import type { AIService, AIInsightResult } from './types';

export class MockAIService implements AIService {
  async generateDailySummary(
    _companyId: string,
    language: Language,
    summary: DashboardSummary = {
      todayIncome: 125750,
      todayExpenses: 68540,
      netProfit: 57210,
      cashBalance: 95430,
      bankBalance: 420680,
      staffPresent: 3,
      staffTotal: 4,
      pendingApprovals: 3,
      pendingApprovalAmount: 75000,
      pendingLeave: 1,
      receivables: 185000,
      payables: 92000,
    }
  ): Promise<AIInsightResult> {
    const titles = {
      en: 'Daily Business Briefing',
      si: 'දෛනික ව්‍යාපාර briefing',
      ta: 'தினசரி வணிக briefing',
    };
    const message =
      language === 'si'
        ? `අද ආදායම ${formatCurrency(summary.todayIncome)}. වියදම ${formatCurrency(summary.todayExpenses)}. ශුද්ධ ලාභ ${formatCurrency(summary.netProfit)}. ${summary.pendingApprovals} අනුමැතිය pending — ${formatCurrency(summary.pendingApprovalAmount)}. ${summary.staffPresent}/${summary.staffTotal} සේවකයින් present.`
        : language === 'ta'
          ? `இன்றைய வருமானம் ${formatCurrency(summary.todayIncome)}. செலவு ${formatCurrency(summary.todayExpenses)}. நிகர லாபம் ${formatCurrency(summary.netProfit)}. ${summary.pendingApprovals} அனுமதிகள் pending — ${formatCurrency(summary.pendingApprovalAmount)}.`
          : `Today you earned ${formatCurrency(summary.todayIncome)} and spent ${formatCurrency(summary.todayExpenses)}. Net profit is ${formatCurrency(summary.netProfit)}. You have ${summary.pendingApprovals} pending approvals totaling ${formatCurrency(summary.pendingApprovalAmount)}. ${summary.staffPresent} of ${summary.staffTotal} staff are present today. Your expenses are 14% higher than last month, mainly due to fuel and maintenance.`;

    return {
      title: titles[language] ?? titles.en,
      message,
      severity: summary.pendingApprovals > 2 ? 'warning' : 'info',
      insightType: 'daily_summary',
    };
  }

  async analyzeExpenseTrend(
    _companyId: string,
    _period: string
  ): Promise<AIInsightResult> {
    return {
      title: 'Expense Trend',
      message:
        'Your expenses are 14% higher than last month, mainly due to fuel and maintenance.',
      severity: 'warning',
      insightType: 'expense_trend',
    };
  }

  async analyzeApprovalRisk(
    _paymentRequestId: string,
    amount: number,
    cashBalance: number
  ): Promise<AIInsightResult> {
    const risk = calculateRiskLevel(amount, 5000, cashBalance);
    const afterBalance = cashBalance - amount;
    return {
      title: 'Approval Analysis',
      message:
        risk === 'high'
          ? `This payment exceeds your cash balance. After approval, cash balance will be ${formatCurrency(afterBalance)}.`
          : risk === 'medium'
            ? `This payment is above your usual limit. After approval, cash balance will be ${formatCurrency(afterBalance)}.`
            : 'This supplier payment is within normal range.',
      severity: risk === 'high' ? 'critical' : risk === 'medium' ? 'warning' : 'info',
      insightType: 'approval_risk',
    };
  }

  async answerBusinessQuestion(
    _companyId: string,
    question: string,
    language: Language,
    summary?: DashboardSummary
  ): Promise<string> {
    const s = summary ?? {
      todayIncome: 125750,
      todayExpenses: 68540,
      netProfit: 57210,
      cashBalance: 95430,
      bankBalance: 420680,
      staffPresent: 3,
      staffTotal: 4,
      pendingApprovals: 3,
      pendingApprovalAmount: 75000,
      pendingLeave: 1,
      receivables: 185000,
      payables: 92000,
    };
    const q = question.toLowerCase();

    if (q.includes('today') || q.includes('business')) {
      return language === 'si'
        ? `අද ඔබ ${formatCurrency(s.netProfit)} ලාභයක් ලබා ඇත. Cash: ${formatCurrency(s.cashBalance)}.`
        : `Today your business made ${formatCurrency(s.netProfit)} profit. Cash balance: ${formatCurrency(s.cashBalance)}. Bank: ${formatCurrency(s.bankBalance)}.`;
    }
    if (q.includes('expense')) {
      return `Today's expenses total ${formatCurrency(s.todayExpenses)}. Fuel (${formatCurrency(12750)}) and internet (${formatCurrency(8500)}) are the largest items.`;
    }
    if (q.includes('absent')) {
      return `Staff attendance is lower this week. ${s.staffTotal - s.staffPresent} staff were absent today. Saman Jayasuriya is on leave.`;
    }
    if (q.includes('approve') || q.includes('payment')) {
      return `You have ${s.pendingApprovals} pending approvals totaling ${formatCurrency(s.pendingApprovalAmount)}. The rent payment of ${formatCurrency(75000)} requires your attention. After approving all, cash balance will be approximately ${formatCurrency(s.cashBalance - s.pendingApprovalAmount)}.`;
    }
    if (q.includes('owe') || q.includes('receive') || q.includes('money')) {
      return `Customers owe you ${formatCurrency(s.receivables)}. Top debtor: Sunshine Holdings (${formatCurrency(75000)}).`;
    }
    if (q.includes('cash') || q.includes('balance')) {
      return `Your cash balance is ${formatCurrency(s.cashBalance)} and bank balance is ${formatCurrency(s.bankBalance)}. Total liquid funds: ${formatCurrency(s.cashBalance + s.bankBalance)}.`;
    }
    if (q.includes('salary')) {
      return `Monthly salary total is ${formatCurrency(275000)} for 4 staff. Payroll is pending your approval.`;
    }
    if (q.includes('increased') || q.includes('month')) {
      return 'Your expenses are 14% higher than last month, mainly due to fuel and maintenance costs.';
    }
    return language === 'si'
      ? 'මම ඔබේ ව්‍යාපාර දත්ත විශ්ලේෂණය කරමි. Dashboard බලන්න.'
      : 'I can help analyze your business data. Try asking about income, expenses, staff, or approvals.';
  }

  async categorizeExpense(text: string, _language: Language): Promise<string> {
    const t = text.toLowerCase();
    if (t.includes('fuel') || t.includes('petrol')) return 'Fuel';
    if (t.includes('rent')) return 'Rent';
    if (t.includes('internet') || t.includes('dialog')) return 'Internet';
    if (t.includes('electric')) return 'Electricity';
    return 'Other';
  }
}
