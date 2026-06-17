import type { Language } from '@bizmanager/i18n';
import type { DashboardSummary } from '@bizmanager/types';
import { MockAIService } from './mock-provider';
import type { AIService, AIInsightResult } from './types';

export class OpenAIService implements AIService {
  private fallback = new MockAIService();
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY ?? '';
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    } catch {
      return null;
    }
  }

  async generateDailySummary(
    companyId: string,
    language: Language,
    summary?: DashboardSummary
  ): Promise<AIInsightResult> {
    const result = await this.callOpenAI(
      `You are a business assistant for Sri Lankan small businesses. Respond in ${language}. Be concise and use Rs. for currency.`,
      `Summarize this business day: ${JSON.stringify(summary)}`
    );
    if (result) {
      return { title: 'Daily Briefing', message: result, severity: 'info', insightType: 'daily_summary' };
    }
    return this.fallback.generateDailySummary(companyId, language, summary);
  }

  async analyzeExpenseTrend(companyId: string, period: string): Promise<AIInsightResult> {
    return this.fallback.analyzeExpenseTrend(companyId, period);
  }

  async analyzeApprovalRisk(
    paymentRequestId: string,
    amount: number,
    cashBalance: number
  ): Promise<AIInsightResult> {
    return this.fallback.analyzeApprovalRisk(paymentRequestId, amount, cashBalance);
  }

  async answerBusinessQuestion(
    companyId: string,
    question: string,
    language: Language,
    context?: DashboardSummary
  ): Promise<string> {
    const result = await this.callOpenAI(
      `Business assistant for Sri Lanka. Language: ${language}. Use simple words. Context: ${JSON.stringify(context)}`,
      question
    );
    return result ?? this.fallback.answerBusinessQuestion(companyId, question, language, context);
  }

  async categorizeExpense(text: string, language: Language): Promise<string> {
    return this.fallback.categorizeExpense(text, language);
  }
}
