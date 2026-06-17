import type { Language } from '@bizmanager/i18n';
import type { DashboardSummary } from '@bizmanager/types';

export interface AIInsightResult {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  insightType: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIService {
  generateDailySummary(
    companyId: string,
    language: Language,
    summary?: DashboardSummary
  ): Promise<AIInsightResult>;

  analyzeExpenseTrend(
    companyId: string,
    period: string
  ): Promise<AIInsightResult>;

  analyzeApprovalRisk(
    paymentRequestId: string,
    amount: number,
    cashBalance: number
  ): Promise<AIInsightResult>;

  answerBusinessQuestion(
    companyId: string,
    question: string,
    language: Language,
    context?: DashboardSummary
  ): Promise<string>;

  categorizeExpense(text: string, language: Language): Promise<string>;
}
