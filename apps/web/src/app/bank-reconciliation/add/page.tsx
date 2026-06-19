'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bankReconciliationSchema, type BankReconciliationInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import {
  createBankReconciliation,
  getAccounts,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { toISODate } from '@bizmanager/utils';

export default function AddBankReconciliationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts(companyId),
    queryFn: () => getAccounts(companyId),
  });

  const bankAccounts = accounts?.filter((a) => a.type === 'bank') ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<BankReconciliationInput>({
    resolver: zodResolver(bankReconciliationSchema),
    defaultValues: { statementDate: toISODate(), openingBalance: 0, closingBalance: 0 },
  });

  const mutation = useMutation({
    mutationFn: createBankReconciliation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankReconciliations(companyId) });
      toast(t('success'), 'success');
      router.push(`/bank-reconciliation/${data.id}`);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('newReconciliation')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <SelectField
            label={t('bankAccount')}
            required
            options={bankAccounts.map((a) => ({ value: a.id, label: a.name }))}
            error={errors.accountId?.message}
            {...register('accountId')}
          />
          <FormInput label={t('statementDate')} type="date" required {...register('statementDate')} />
          <FormInput label={t('openingBalance')} type="number" required {...register('openingBalance')} />
          <FormInput label={t('closingBalance')} type="number" required {...register('closingBalance')} />
          <TextAreaField label={t('notes')} {...register('notes')} />
          <PremiumButton type="submit" loading={mutation.isPending} className="w-full">{t('save')}</PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
