import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileStore } from '@/stores/app-store';
import { getDashboardSummary, getTransactions, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { colors, spacing, radius } from '@bizmanager/design-tokens';

export default function FinanceScreen() {
  const { t } = useTranslation();
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('finance')}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary}><Text style={styles.btnText}>{t('addIncome')}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>{t('addExpense')}</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>{t('monthlyIncome')}</Text>
          <Text style={[styles.value, { color: colors.income }]}>{formatCurrency(summary?.todayIncome ?? 0)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>{t('monthlyExpenses')}</Text>
          <Text style={[styles.value, { color: colors.expense }]}>{formatCurrency(summary?.todayExpenses ?? 0)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>{t('netProfit')}</Text>
          <Text style={styles.value}>{formatCurrency(summary?.netProfit ?? 0)}</Text>
        </View>
        <Text style={styles.section}>{t('recentActivity')}</Text>
        {transactions?.map((tx) => (
          <View key={tx.id} style={styles.row}>
            <Text style={styles.rowText}>{tx.description ?? tx.category}</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  actions: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  btnPrimary: { flex: 1, backgroundColor: colors.primary.DEFAULT, borderRadius: radius.md, padding: spacing[3], alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnSecondary: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing[3], alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  btnSecondaryText: { fontWeight: '600', color: colors.text.primary },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  label: { fontSize: 13, color: colors.text.secondary },
  value: { fontSize: 28, fontWeight: '700', marginTop: spacing[1] },
  section: { fontSize: 16, fontWeight: '600', marginTop: spacing[2], marginBottom: spacing[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { fontSize: 14 },
});
