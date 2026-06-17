import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileStore } from '@/stores/app-store';
import {
  createIncome,
  getCustomers,
  getAccounts,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { toISODate } from '@bizmanager/utils';
import { colors, spacing, radius } from '@bizmanager/design-tokens';

export default function AddIncomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');

  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts(companyId),
    queryFn: () => getAccounts(companyId),
  });

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers(companyId),
    queryFn: () => getCustomers(companyId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createIncome({
        amount: Number(amount),
        paymentMethod,
        transactionDate: toISODate(),
        notes: notes || null,
        markAsPaid: true,
        customerId: customers?.[0]?.id ?? null,
        accountId: accounts?.find((a) => a.type === 'cash')?.id ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(companyId, 'monthly') });
      router.back();
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('addIncome')}</Text>

        <Text style={styles.label}>{t('amount')}</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        <Text style={styles.label}>{t('paymentMethod')}</Text>
        <View style={styles.row}>
          {(['cash', 'bank_transfer'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, paymentMethod === m && styles.chipActive]}
              onPress={() => setPaymentMethod(m)}
            >
              <Text style={paymentMethod === m ? styles.chipTextActive : styles.chipText}>
                {m.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('notes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {mutation.isError && (
          <Text style={styles.error}>{(mutation.error as Error).message}</Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          disabled={!amount || mutation.isPending}
          onPress={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{t('save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  back: { color: colors.primary.DEFAULT, fontWeight: '600', marginBottom: spacing[3] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  label: { fontSize: 14, fontWeight: '500', color: colors.text.secondary, marginBottom: spacing[1], marginTop: spacing[3] },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing[3], fontSize: 16, backgroundColor: colors.surface },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  chipText: { textTransform: 'capitalize', color: colors.text.primary },
  chipTextActive: { color: '#fff', textTransform: 'capitalize' },
  btn: { backgroundColor: colors.primary.DEFAULT, borderRadius: radius.md, padding: spacing[4], marginTop: spacing[6], alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: colors.danger.DEFAULT, marginTop: spacing[3] },
});
