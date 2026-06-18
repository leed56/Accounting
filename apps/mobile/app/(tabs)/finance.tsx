import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import { getDashboardSummary, getTransactions, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { spacing, radius } from '@bizmanager/design-tokens';

export default function FinanceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: summary } = useQuery({
    queryKey: queryKeys.dashboard(companyId, 'monthly'),
    queryFn: () => getDashboardSummary(companyId),
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId),
    queryFn: () => getTransactions(companyId, { limit: 8 }),
  });

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('finance')}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary.DEFAULT }]} onPress={() => router.push('/add-income')}>
            <Text style={styles.btnText}>{t('addIncome')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/add-expense')}
          >
            <Text style={[styles.btnSecondaryText, { color: colors.text.primary }]}>{t('addExpense')}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>{t('monthlyIncome')}</Text>
          <Text style={[styles.value, { color: colors.income }]}>{formatCurrency(summary?.todayIncome ?? 0)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>{t('monthlyExpenses')}</Text>
          <Text style={[styles.value, { color: colors.expense }]}>{formatCurrency(summary?.todayExpenses ?? 0)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>{t('netProfit')}</Text>
          <Text style={[styles.value, { color: colors.text.primary }]}>{formatCurrency(summary?.netProfit ?? 0)}</Text>
        </View>
        <Text style={[styles.section, { color: colors.text.primary }]}>{t('recentActivity')}</Text>
        {transactions?.map((tx) => (
          <View key={tx.id} style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowText, { color: colors.text.primary }]}>{tx.description ?? tx.category}</Text>
            <Text style={{ color: tx.type === 'income' ? colors.income : colors.expense, fontWeight: '600' }}>
              {formatCurrency(tx.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  actions: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  btnPrimary: { flex: 1, borderRadius: radius.md, padding: spacing[3], alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnSecondary: { flex: 1, borderRadius: radius.md, padding: spacing[3], alignItems: 'center', borderWidth: 1 },
  btnSecondaryText: { fontWeight: '600' },
  card: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3], borderWidth: 1 },
  label: { fontSize: 13 },
  value: { fontSize: 28, fontWeight: '700', marginTop: spacing[1] },
  section: { fontSize: 16, fontWeight: '600', marginTop: spacing[2], marginBottom: spacing[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1 },
  rowText: { fontSize: 14, flex: 1, marginRight: spacing[2] },
});
