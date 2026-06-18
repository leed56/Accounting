import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import { getPaymentRequests, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { spacing, radius } from '@bizmanager/design-tokens';

export default function ApprovalsScreen() {
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: requests } = useQuery({
    queryKey: queryKeys.paymentRequests(companyId, 'pending'),
    queryFn: () => getPaymentRequests(companyId, 'pending'),
  });

  const total = requests?.reduce((s, r) => s + r.amount, 0) ?? 0;

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('approvals')}</Text>
        <View style={[styles.totalCard, { backgroundColor: colors.warning.light }]}>
          <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>{t('pendingApprovals')}</Text>
          <Text style={[styles.totalValue, { color: colors.text.primary }]}>{formatCurrency(total)}</Text>
          <Text style={[styles.totalCount, { color: colors.text.secondary }]}>{requests?.length ?? 0} requests</Text>
        </View>
        {requests?.map((r) => (
          <View key={r.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.payee, { color: colors.text.primary }]}>{r.payee_name ?? r.category}</Text>
              <Text style={[styles.amount, { color: colors.text.primary }]}>{formatCurrency(r.amount)}</Text>
            </View>
            <Text style={[styles.desc, { color: colors.text.secondary }]}>{r.description}</Text>
            {r.ai_note && (
              <Text style={[styles.aiNote, { color: colors.ai.DEFAULT, backgroundColor: colors.ai.light }]}>{r.ai_note}</Text>
            )}
            <View style={styles.badges}>
              <Text style={[styles.badge, { backgroundColor: colors.border, color: colors.text.secondary }]}>{r.status}</Text>
              <Text style={[styles.badge, { backgroundColor: colors.border, color: colors.text.secondary }]}>{r.risk_level} risk</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  totalCard: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  totalLabel: { fontSize: 13 },
  totalValue: { fontSize: 32, fontWeight: '700', marginTop: spacing[1] },
  totalCount: { fontSize: 13, marginTop: spacing[1] },
  card: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3], borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  payee: { fontWeight: '600', fontSize: 16, flex: 1, marginRight: spacing[2] },
  amount: { fontWeight: '700', fontSize: 18 },
  desc: { fontSize: 13, marginTop: spacing[2] },
  aiNote: { fontSize: 12, padding: spacing[2], borderRadius: radius.md, marginTop: spacing[2] },
  badges: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.full, textTransform: 'capitalize' },
});
