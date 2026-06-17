import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileStore } from '@/stores/app-store';
import { getPaymentRequests, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { colors, spacing, radius } from '@bizmanager/design-tokens';

export default function ApprovalsScreen() {
  const { t } = useTranslation();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: requests } = useQuery({
    queryKey: queryKeys.paymentRequests(companyId, 'pending'),
    queryFn: () => getPaymentRequests(companyId, 'pending'),
  });

  const total = requests?.reduce((s, r) => s + r.amount, 0) ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('approvals')}</Text>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t('pendingApprovals')}</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          <Text style={styles.totalCount}>{requests?.length ?? 0} requests</Text>
        </View>
        {requests?.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.payee}>{r.payee_name ?? r.category}</Text>
              <Text style={styles.amount}>{formatCurrency(r.amount)}</Text>
            </View>
            <Text style={styles.desc}>{r.description}</Text>
            {r.ai_note && <Text style={styles.aiNote}>{r.ai_note}</Text>}
            <View style={styles.badges}>
              <Text style={styles.badge}>{r.status}</Text>
              <Text style={styles.badge}>{r.risk_level} risk</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  totalCard: { backgroundColor: colors.warning.light, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  totalLabel: { fontSize: 13, color: colors.text.secondary },
  totalValue: { fontSize: 32, fontWeight: '700', marginTop: spacing[1] },
  totalCount: { fontSize: 13, color: colors.text.secondary, marginTop: spacing[1] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  payee: { fontWeight: '600', fontSize: 16, flex: 1 },
  amount: { fontWeight: '700', fontSize: 18 },
  desc: { fontSize: 13, color: colors.text.secondary, marginTop: spacing[2] },
  aiNote: { fontSize: 12, color: colors.ai.DEFAULT, backgroundColor: colors.ai.light, padding: spacing[2], borderRadius: radius.md, marginTop: spacing[2] },
  badges: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] },
  badge: { fontSize: 11, fontWeight: '600', backgroundColor: '#f3f4f6', paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.full, textTransform: 'capitalize' },
});
