import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import { useMobileProfileId } from '@/hooks/useMobileProfile';
import {
  getDashboardSummary,
  getTransactions,
  getCompany,
  getNotifications,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { getDailyInsight } from '@bizmanager/ai';
import { formatCurrency, getTimeGreeting, filterNotificationsByPrefs } from '@bizmanager/utils';
import { spacing, radius } from '@bizmanager/design-tokens';

function MetricCard({
  label,
  value,
  variant,
  colors,
}: {
  label: string;
  value: string;
  variant?: string;
  colors: ReturnType<typeof import('@/hooks/useMobileTheme').useMobileTheme>['colors'];
}) {
  const borderColor =
    variant === 'income'
      ? colors.income
      : variant === 'expense'
        ? colors.expense
        : variant === 'warning'
          ? colors.warning.DEFAULT
          : colors.border;
  return (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        { borderLeftColor: borderColor, borderLeftWidth: variant ? 4 : 1 },
      ]}
    >
      <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text.primary }]}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const notificationPrefs = useMobileStore((s) => s.notificationPrefs);
  const { data: profileId } = useMobileProfileId();
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

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications(profileId ?? ''),
    queryFn: () => getNotifications(profileId!),
    enabled: !!profileId,
    refetchInterval: 60_000,
  });

  const unreadCount = filterNotificationsByPrefs(notifications ?? [], notificationPrefs).filter(
    (n) => !n.is_read
  ).length;

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>{company?.name ?? 'BizManager'}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.headerTitle}>{t('dashboard')}</Text>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
                <Ionicons name="search" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
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
          <View style={[styles.insightCard, { backgroundColor: colors.ai.light }]}>
            <Text style={[styles.insightTitle, { color: colors.text.primary }]}>{aiInsight.title}</Text>
            <Text style={[styles.insightText, { color: colors.text.secondary }]}>{aiInsight.message}</Text>
          </View>
        )}

        <View style={styles.grid}>
          <MetricCard label={t('todayIncome')} value={formatCurrency(summary?.todayIncome ?? 0)} variant="income" colors={colors} />
          <MetricCard label={t('todayExpenses')} value={formatCurrency(summary?.todayExpenses ?? 0)} variant="expense" colors={colors} />
          <MetricCard label={t('netProfit')} value={formatCurrency(summary?.netProfit ?? 0)} colors={colors} />
          <MetricCard label={t('cashBalance')} value={formatCurrency(summary?.cashBalance ?? 0)} colors={colors} />
          <MetricCard label={t('pendingApprovals')} value={String(summary?.pendingApprovals ?? 0)} variant="warning" colors={colors} />
          <MetricCard label={t('moneyToReceive')} value={formatCurrency(summary?.receivables ?? 0)} variant="income" colors={colors} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('recentActivity')}</Text>
        {transactions?.map((tx) => (
          <View key={tx.id} style={[styles.txRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.txDesc, { color: colors.text.primary }]}>{tx.description ?? tx.category}</Text>
            <Text style={[styles.txAmount, tx.type === 'income' ? { color: colors.income } : { color: colors.expense }]}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  hero: {
    backgroundColor: '#16A34A',
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  heroActions: { flexDirection: 'row', gap: spacing[2] },
  iconBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  companyName: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: spacing[1] },
  headerTitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: spacing[1] },
  quickRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] },
  quickBtn: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, padding: spacing[3], alignItems: 'center' },
  quickBtnText: { color: '#16A34A', fontWeight: '600', fontSize: 13 },
  quickBtnAlt: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  quickBtnTextAlt: { color: '#fff', fontWeight: '600', fontSize: 13 },
  insightCard: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  insightTitle: { fontWeight: '600', marginBottom: spacing[1] },
  insightText: { fontSize: 14, lineHeight: 20 },
  grid: { gap: spacing[3] },
  metricCard: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[2] },
  metricLabel: { fontSize: 13 },
  metricValue: { fontSize: 24, fontWeight: '700', marginTop: spacing[1] },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing[4], marginBottom: spacing[3] },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1 },
  txDesc: { flex: 1, fontSize: 14 },
  txAmount: { fontWeight: '600' },
});
