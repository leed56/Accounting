import type { Language } from '@bizmanager/i18n';
import {
  getDashboardSummary,
  sampleDashboard,
  isDemoMode,
} from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { MockAIService } from './mock-provider';
import { OpenAIService } from './openai-provider';
import type { AIService } from './types';

let serviceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (serviceInstance) return serviceInstance;
  const hasOpenAI = Boolean(
    process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')
  );
  serviceInstance = hasOpenAI ? new OpenAIService() : new MockAIService();
  return serviceInstance;
}

export async function getDailyInsight(
  companyId: string,
  language: Language
) {
  const summary = isDemoMode()
    ? sampleDashboard
    : await getDashboardSummary(companyId);
  const service = getAIService();
  return service.generateDailySummary(companyId, language, summary);
}

export async function askBusinessQuestion(
  companyId: string,
  question: string,
  language: Language
) {
  const summary = isDemoMode()
    ? sampleDashboard
    : await getDashboardSummary(companyId);
  const service = getAIService();
  return service.answerBusinessQuestion(companyId, question, language, summary);
}

export { formatCurrency };
