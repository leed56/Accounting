import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileStore } from '@/stores/app-store';
import {
  getDashboardSummary,
  getTransactions,
  getCompany,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { getDailyInsight } from '@bizmanager/ai';
import { formatCurrency, getTimeGreeting } from '@bizmanager/utils';
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
  const router = useRouter();
  const { t, language } = useTranslation();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const greetingKey = getTimeGreeting();
  const greeting =
    greetingKey === 'morning' ? t('goodMorning') : greetingKey === 'afternoon' ? t('goodAfternoon') : t('goodEvening');

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

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
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>{company?.name ?? 'BizManager'}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.headerTitle}>{t('dashboard')}</Text>
            </View>
            <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/search')}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/add-income')}>
              <Text style={styles.quickBtnText}>{t('addIncome')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickBtn, styles.quickBtnAlt]} onPress={() => router.push('/add-expense')}>
              <Text style={styles.quickBtnTextAlt}>{t('addExpense')}</Text>
            </TouchableOpacity>
          </View>
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
  hero: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchBtnText: { fontSize: 18 },
  companyName: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: spacing[1] },
  headerTitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: spacing[1] },
  quickRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] },
  quickBtn: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, padding: spacing[3], alignItems: 'center' },
  quickBtnText: { color: colors.primary.DEFAULT, fontWeight: '600', fontSize: 13 },
  quickBtnAlt: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  quickBtnTextAlt: { color: '#fff', fontWeight: '600', fontSize: 13 },
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
