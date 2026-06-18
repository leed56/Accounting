'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseSchema, type ExpenseInput } from '@bizmanager/types';
import { PAYMENT_METHODS } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import {
  createExpense,
  uploadReceipt,
  getExpenseCategories,
  getSuppliers,
  getAccounts,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { toISODate } from '@bizmanager/utils';

export default function AddExpensePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [receipt, setReceipt] = useState<File | null>(null);

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getExpenseCategories(companyId),
  });

  const { data: suppliers } = useQuery({
    queryKey: queryKeys.suppliers(companyId),
    queryFn: () => getSuppliers(companyId),
  });

  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts(companyId),
    queryFn: () => getAccounts(companyId),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      paymentMethod: 'cash',
      transactionDate: toISODate(),
      requiresApproval: false,
      category: 'Fuel',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ExpenseInput) => {
      const result = await createExpense({
        ...data,
        supplierId: data.supplierId || null,
        accountId: data.accountId || accounts?.find((a) => a.type === 'cash')?.id || null,
      });
      if (receipt && result.transaction?.id) {
        try {
          await uploadReceipt(receipt, 'transaction', result.transaction.id);
        } catch {
          /* receipt optional — don't fail expense */
        }
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentRequests(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(companyId, 'daily') });
      toast(
        result.needsApproval ? 'Expense submitted for approval' : t('success'),
        'success'
      );
      router.push(result.needsApproval ? '/approvals' : '/expenses');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('addExpense')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <SelectField
            label={t('category')}
            required
            options={categories?.map((c) => ({ value: c.name_en, label: c.name_en, key: c.id })) ?? [{ value: 'Other', label: 'Other' }]}
            error={errors.category?.message}
            {...register('category')}
          />
          <FormInput label={t('amount')} required error={errors.amount?.message} {...register('amount')} />
          <SelectField
            label={t('paymentMethod')}
            required
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m.replace(/_/g, ' ') }))}
            {...register('paymentMethod')}
          />
          <SelectField
            label={t('vendor')}
            options={[
              { value: '', label: '— Optional —' },
              ...(suppliers?.map((s) => ({ value: s.id, label: s.name })) ?? []),
            ]}
            {...register('supplierId')}
          />
          <SelectField
            label="Account"
            options={accounts?.map((a) => ({ value: a.id, label: `${a.name} (${a.type})` })) ?? []}
            {...register('accountId')}
          />
          <FormInput label={t('date')} type="date" required {...register('transactionDate')} />
          <TextAreaField label={t('notes')} {...register('notes')} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('requiresApproval')} className="rounded" />
            {t('requiresApproval')}
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
            {t('submit')}
          </PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
