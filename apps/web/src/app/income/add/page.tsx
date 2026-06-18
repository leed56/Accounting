'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incomeSchema, type IncomeInput } from '@bizmanager/types';
import { PAYMENT_METHODS } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import {
  createIncome,
  uploadReceipt,
  getCustomers,
  getAccounts,
  getIncomeCategories,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { toISODate, getCategoryName } from '@bizmanager/utils';

export default function AddIncomePage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [receipt, setReceipt] = useState<File | null>(null);

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers(companyId),
    queryFn: () => getCustomers(companyId),
  });

  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts(companyId),
    queryFn: () => getAccounts(companyId),
  });

  const { data: categories } = useQuery({
    queryKey: queryKeys.incomeCategories(companyId),
    queryFn: () => getIncomeCategories(companyId),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      category: 'General Income',
      paymentMethod: 'cash',
      transactionDate: toISODate(),
      markAsPaid: true,
    },
  });

  useEffect(() => {
    if (categories?.[0]) {
      reset({
        category: categories[0].name_en,
        paymentMethod: 'cash',
        transactionDate: toISODate(),
        markAsPaid: true,
      });
    }
  }, [categories, reset]);

  const mutation = useMutation({
    mutationFn: async (data: IncomeInput) => {
      const result = await createIncome({
        ...data,
        customerId: data.customerId || null,
        accountId: data.accountId || accounts?.find((a) => a.type === 'cash')?.id || null,
      });
      if (receipt && result?.id) {
        try {
          await uploadReceipt(receipt, 'transaction', result.id);
        } catch {
          /* receipt optional */
        }
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(companyId, 'daily') });
      toast(t('success'), 'success');
      router.push('/income');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('addIncome')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <SelectField
            label={t('category')}
            required
            options={categories?.map((c) => ({
              value: c.name_en,
              label: getCategoryName(c, language),
              key: c.id,
            })) ?? [{ value: 'General Income', label: 'General Income' }]}
            error={errors.category?.message}
            {...register('category')}
          />
          <SelectField
            label={t('customer')}
            options={[
              { value: '', label: '— Select —' },
              ...(customers?.map((c) => ({ value: c.id, label: c.name })) ?? []),
            ]}
            {...register('customerId')}
          />
          <FormInput label={t('amount')} required error={errors.amount?.message} {...register('amount')} />
          <SelectField
            label={t('paymentMethod')}
            required
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m.replace(/_/g, ' ') }))}
            error={errors.paymentMethod?.message}
            {...register('paymentMethod')}
          />
          <SelectField
            label="Account"
            options={accounts?.map((a) => ({ value: a.id, label: `${a.name} (${a.type})` })) ?? []}
            {...register('accountId')}
          />
          <FormInput label={t('date')} type="date" required {...register('transactionDate')} />
          <TextAreaField label={t('notes')} {...register('notes')} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('markAsPaid')} className="rounded" />
            {t('markAsPaid')}
          </label>
          <div>
            <label className="label">{t('attachReceipt')}</label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="input-field py-2"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
            />
          </div>
          <PremiumButton type="submit" loading={mutation.isPending} className="w-full">
            {t('save')}
          </PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
