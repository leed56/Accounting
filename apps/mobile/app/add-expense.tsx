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
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import {
  createExpense,
  getExpenseCategories,
  getAccounts,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { toISODate } from '@bizmanager/utils';
import type { PaymentMethod } from '@bizmanager/types';
import { spacing, radius } from '@bizmanager/design-tokens';

const MOBILE_PAYMENT_METHODS: PaymentMethod[] = ['cash', 'bank_transfer', 'cheque', 'lankaqr'];

export default function AddExpenseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const queryClient = useQueryClient();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Fuel');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [chequeNumber, setChequeNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getExpenseCategories(companyId),
  });

  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts(companyId),
    queryFn: () => getAccounts(companyId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createExpense({
        category,
        amount: Number(amount),
        paymentMethod,
        chequeNumber: paymentMethod === 'cheque' ? chequeNumber : null,
        paymentReference: paymentMethod === 'lankaqr' ? paymentReference : null,
        transactionDate: toISODate(),
        notes: notes || null,
        requiresApproval: Number(amount) > 6000,
        supplierId: null,
        accountId: accounts?.find((a) => a.type === 'cash')?.id ?? null,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(companyId, 'monthly') });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentRequests(companyId) });
      router.replace(result.needsApproval ? '/(tabs)/approvals' : '/(tabs)/finance');
    },
  });

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.primary.DEFAULT }]}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('addExpense')}</Text>

        <Text style={[styles.label, { color: colors.text.secondary }]}>{t('category')}</Text>
        <View style={styles.row}>
          {categories?.slice(0, 4).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                category === c.name_en && { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
              ]}
              onPress={() => setCategory(c.name_en)}
            >
              <Text style={{ color: category === c.name_en ? '#fff' : colors.text.primary }}>{c.name_en}</Text>
            </TouchableOpacity>
          )) ?? ['Fuel', 'Other'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                category === c && { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
              ]}
              onPress={() => setCategory(c)}
            >
              <Text style={{ color: category === c ? '#fff' : colors.text.primary }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text.secondary }]}>{t('amount')}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text.primary }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.text.muted}
        />

        <Text style={[styles.label, { color: colors.text.secondary }]}>{t('paymentMethod')}</Text>
        <View style={styles.row}>
          {MOBILE_PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                paymentMethod === m && { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
              ]}
              onPress={() => setPaymentMethod(m)}
            >
              <Text style={{ color: paymentMethod === m ? '#fff' : colors.text.primary, textTransform: 'capitalize' }}>
                {m.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {paymentMethod === 'cheque' && (
          <>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t('chequeNumber')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text.primary }]}
              value={chequeNumber}
              onChangeText={setChequeNumber}
              placeholderTextColor={colors.text.muted}
            />
          </>
        )}

        {paymentMethod === 'lankaqr' && (
          <>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t('lankaQrReference')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text.primary }]}
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholderTextColor={colors.text.muted}
            />
          </>
        )}

        <Text style={[styles.label, { color: colors.text.secondary }]}>{t('notes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text.primary }]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholderTextColor={colors.text.muted}
        />

        {mutation.isError && (
          <Text style={[styles.error, { color: colors.danger.DEFAULT }]}>{(mutation.error as Error).message}</Text>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary.DEFAULT }]}
          disabled={!amount || mutation.isPending}
          onPress={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{t('submit')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  back: { fontWeight: '600', marginBottom: spacing[3] },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing[4] },
  label: { fontSize: 14, fontWeight: '500', marginBottom: spacing[1], marginTop: spacing[3] },
  input: { borderWidth: 1, borderRadius: radius.md, padding: spacing[3], fontSize: 16 },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.md, borderWidth: 1 },
  btn: { borderRadius: radius.md, padding: spacing[4], marginTop: spacing[6], alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { marginTop: spacing[3] },
});
