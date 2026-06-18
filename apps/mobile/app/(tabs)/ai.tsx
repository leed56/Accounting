import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import { askBusinessQuestion, getDailyInsight } from '@bizmanager/ai';
import { SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { spacing, radius } from '@bizmanager/design-tokens';

const suggestions = [
  'aiQuestionToday',
  'aiQuestionExpenses',
  'aiQuestionAbsent',
  'aiQuestionCash',
] as const;

export default function AIScreen() {
  const { t, language } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const { data: briefing } = useQuery({
    queryKey: ['ai-briefing', companyId, language],
    queryFn: () => getDailyInsight(companyId, language),
  });

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    const reply = await askBusinessQuestion(companyId, text, language);
    setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('aiAssistant')}</Text>
        {briefing && (
          <View style={[styles.briefing, { backgroundColor: colors.ai.light }]}>
            <Text style={[styles.briefingTitle, { color: colors.text.primary }]}>{briefing.title}</Text>
            <Text style={[styles.briefingText, { color: colors.text.secondary }]}>{briefing.message}</Text>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {suggestions.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, { backgroundColor: colors.ai.light }]}
              onPress={() => send(t(key))}
            >
              <Text style={[styles.chipText, { color: colors.ai.DEFAULT }]}>{t(key)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.chat}>
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                msg.role === 'user'
                  ? { alignSelf: 'flex-end', backgroundColor: colors.primary.DEFAULT }
                  : { alignSelf: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.bubbleText, { color: msg.role === 'user' ? '#fff' : colors.text.primary }]}>
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && <Text style={[styles.loading, { color: colors.text.muted }]}>{t('loading')}</Text>}
        </View>
      </ScrollView>
      <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text.primary }]}
          value={input}
          onChangeText={setInput}
          placeholder={t('askAnything')}
          placeholderTextColor={colors.text.muted}
          onSubmitEditing={() => send(input)}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary.DEFAULT }]} onPress={() => send(input)}>
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[4] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  briefing: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  briefingTitle: { fontWeight: '600', marginBottom: spacing[1] },
  briefingText: { fontSize: 14, lineHeight: 20 },
  chips: { marginBottom: spacing[4] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, marginRight: spacing[2] },
  chipText: { fontSize: 13, fontWeight: '500' },
  chat: { minHeight: 200 },
  bubble: { maxWidth: '85%', padding: spacing[3], borderRadius: radius.lg, marginBottom: spacing[2] },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  loading: { fontSize: 13 },
  inputRow: { flexDirection: 'row', padding: spacing[3], borderTopWidth: 1, gap: spacing[2] },
  input: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing[3], fontSize: 16 },
  sendBtn: { borderRadius: radius.md, width: 48, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
