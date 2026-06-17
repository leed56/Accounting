import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileStore } from '@/stores/app-store';
import { getStaff, getAttendance, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency, toISODate } from '@bizmanager/utils';
import { colors, spacing, radius } from '@bizmanager/design-tokens';

export default function StaffScreen() {
  const { t } = useTranslation();
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('staff')}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{staff?.length ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('staffPresent')}</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {attendance?.filter((a) => a.status === 'present' || a.status === 'late').length ?? 0}
            </Text>
          </View>
        </View>
        {staff?.map((s) => {
          const att = attendance?.find((a) => a.staff_id === s.id);
          return (
            <View key={s.id} style={styles.card}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{s.full_name.charAt(0)}</Text></View>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{s.full_name}</Text>
                <Text style={styles.role}>{s.role_title}</Text>
                <Text style={styles.salary}>{formatCurrency(s.basic_salary)}/mo</Text>
              </View>
              {att && (
                <View style={[styles.badge, att.status === 'present' ? styles.badgeGreen : styles.badgeRed]}>
                  <Text style={styles.badgeText}>{att.status}</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  summaryRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[4] },
  summaryLabel: { fontSize: 13, color: colors.text.secondary },
  summaryValue: { fontSize: 28, fontWeight: '700', marginTop: spacing[1] },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary.dark, fontWeight: '700', fontSize: 18 },
  cardBody: { flex: 1, marginLeft: spacing[3] },
  name: { fontWeight: '600', fontSize: 16 },
  role: { color: colors.text.secondary, fontSize: 13 },
  salary: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  badge: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.full },
  badgeGreen: { backgroundColor: colors.primary.light },
  badgeRed: { backgroundColor: colors.danger.light },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
