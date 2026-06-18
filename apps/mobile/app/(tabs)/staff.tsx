import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import { getStaff, getAttendance, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency, toISODate } from '@bizmanager/utils';
import { spacing, radius } from '@bizmanager/design-tokens';

export default function StaffScreen() {
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const today = toISODate();

  const { data: staff } = useQuery({
    queryKey: queryKeys.staff(companyId),
    queryFn: () => getStaff(companyId),
  });

  const { data: attendance } = useQuery({
    queryKey: queryKeys.attendance(companyId, today),
    queryFn: () => getAttendance(companyId, today),
  });

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('staff')}</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>{staff?.length ?? 0}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>{t('staffPresent')}</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {attendance?.filter((a) => a.status === 'present' || a.status === 'late').length ?? 0}
            </Text>
          </View>
        </View>
        {staff?.map((s) => {
          const att = attendance?.find((a) => a.staff_id === s.id);
          return (
            <View key={s.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary.light }]}>
                <Text style={[styles.avatarText, { color: colors.primary.DEFAULT }]}>{s.full_name.charAt(0)}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.name, { color: colors.text.primary }]}>{s.full_name}</Text>
                <Text style={[styles.role, { color: colors.text.secondary }]}>{s.role_title}</Text>
                <Text style={[styles.salary, { color: colors.text.muted }]}>{formatCurrency(s.basic_salary)}/mo</Text>
              </View>
              {att && (
                <View
                  style={[
                    styles.badge,
                    att.status === 'present' || att.status === 'late'
                      ? { backgroundColor: colors.primary.light }
                      : { backgroundColor: colors.danger.light },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.text.primary }]}>{att.status}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  summaryRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  summaryCard: { flex: 1, borderRadius: radius.lg, padding: spacing[4], borderWidth: 1 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 28, fontWeight: '700', marginTop: spacing[1] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', fontSize: 18 },
  cardBody: { flex: 1, marginLeft: spacing[3] },
  name: { fontWeight: '600', fontSize: 16 },
  role: { fontSize: 13 },
  salary: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.full },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
