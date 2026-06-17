import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileStore } from '@/stores/app-store';
import {
  getDashboardSummary,
  getTransactions,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { getDailyInsight } from '@bizmanager/ai';
import { formatCurrency } from '@bizmanager/utils';
import { colors, spacing, radius } from '@bizmanager/design-tokens';

function MetricCard({ label, value, variant }: { label: string; value: string; variant?: string }) {
  const borderColor =
    variant === 'income' ? colors.income : variant === 'expense' ? colors.expense : variant === 'warning' ? colors.warning.DEFAULT : colors.border;
  return (
    <View style={[styles.metricCard, { borderLeftColor: borderColor, borderLeftWidth: variant ? 4 : 0 }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { t, language } = useTranslation();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: summary } = useQuery({
    queryKey: queryKeys.dashboard(companyId, 'daily'),
    queryFn: () => getDashboardSummary(companyId),
  });

  const { data: aiInsight } = useQuery({
    queryKey: ['ai-daily', companyId, language],
    queryFn: () => getDailyInsight(companyId, language),
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId, { limit: '3' }),
    queryFn: () => getTransactions(companyId, { limit: 3 }),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Royal Travels Office</Text>
          <Text style={styles.headerTitle}>{t('dashboard')}</Text>
        </View>

        {aiInsight && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>{aiInsight.title}</Text>
            <Text style={styles.insightText}>{aiInsight.message}</Text>
          </View>
        )}

        <View style={styles.grid}>
          <MetricCard label={t('todayIncome')} value={formatCurrency(summary?.todayIncome ?? 0)} variant="income" />
          <MetricCard label={t('todayExpenses')} value={formatCurrency(summary?.todayExpenses ?? 0)} variant="expense" />
          <MetricCard label={t('netProfit')} value={formatCurrency(summary?.netProfit ?? 0)} />
          <MetricCard label={t('cashBalance')} value={formatCurrency(summary?.cashBalance ?? 0)} />
          <MetricCard label={t('bankBalance')} value={formatCurrency(summary?.bankBalance ?? 0)} />
          <MetricCard label={t('staffPresent')} value={`${summary?.staffPresent ?? 0}/${summary?.staffTotal ?? 0}`} />
          <MetricCard label={t('pendingApprovals')} value={String(summary?.pendingApprovals ?? 0)} variant="warning" />
          <MetricCard label={t('moneyToReceive')} value={formatCurrency(summary?.receivables ?? 0)} variant="income" />
        </View>

        <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
        {transactions?.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <Text style={styles.txDesc}>{tx.description ?? tx.category}</Text>
            <Text style={[styles.txAmount, tx.type === 'income' ? styles.income : styles.expense]}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  header: { marginBottom: spacing[4] },
  greeting: { fontSize: 14, color: colors.text.secondary },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  insightCard: { backgroundColor: colors.ai.light, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  insightTitle: { fontWeight: '600', color: colors.text.primary, marginBottom: spacing[1] },
  insightText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  grid: { gap: spacing[3] },
  metricCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[2] },
  metricLabel: { fontSize: 13, color: colors.text.secondary },
  metricValue: { fontSize: 24, fontWeight: '700', marginTop: spacing[1] },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing[4], marginBottom: spacing[3] },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  txDesc: { flex: 1, fontSize: 14, color: colors.text.primary },
  txAmount: { fontWeight: '600' },
  income: { color: colors.income },
  expense: { color: colors.expense },
});
