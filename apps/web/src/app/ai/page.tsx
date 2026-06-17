'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { InsightCard } from '@/components/insight-card';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { askBusinessQuestion, getDailyInsight } from '@bizmanager/ai';
import { SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useQuery } from '@tanstack/react-query';
import { Send, Sparkles } from 'lucide-react';
import type { AIChatMessage } from '@bizmanager/ai';

const suggestedKeys = [
  'aiQuestionToday',
  'aiQuestionExpenses',
  'aiQuestionAbsent',
  'aiQuestionApprove',
  'aiQuestionIncreased',
  'aiQuestionSalary',
  'aiQuestionOwes',
  'aiQuestionCash',
] as const;

export default function AIPage() {
  const { t, language } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: briefing } = useQuery({
    queryKey: ['ai-briefing', companyId, language],
    queryFn: () => getDailyInsight(companyId, language),
  });

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', content: text, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);
    const reply = await askBusinessQuestion(companyId, text, language);
    setMessages((m) => [...m, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
    setLoading(false);
  };

  return (
    <AppShell title={t('aiAssistant')}>
      <div className="max-w-3xl mx-auto space-y-6">
        {briefing && (
          <InsightCard title={t('dailyBriefing')} message={briefing.message} severity="info" />
        )}

        <div className="flex flex-wrap gap-2">
          {suggestedKeys.map((key) => (
            <button
              key={key}
              onClick={() => sendMessage(t(key))}
              className="px-3 py-2 rounded-full bg-ai-light text-ai text-sm font-medium hover:bg-ai/20 min-h-[36px]"
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className="card min-h-[400px] flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('askAnything')}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-400 animate-pulse">{t('loading')}</div>
            )}
          </div>
          <div className="flex gap-2 border-t border-gray-100 pt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder={t('askAnything')}
              className="input-field flex-1"
            />
            <PremiumButton onClick={() => sendMessage(input)} disabled={loading}>
              <Send className="h-4 w-4" />
            </PremiumButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
