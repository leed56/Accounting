'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, type ExpenseInput } from '@bizmanager/types';
import { PAYMENT_METHODS } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useQuery } from '@tanstack/react-query';
import { getExpenseCategories, getSuppliers, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { toISODate } from '@bizmanager/utils';

export default function AddExpensePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getExpenseCategories(companyId),
  });

  const { data: suppliers } = useQuery({
    queryKey: queryKeys.suppliers(companyId),
    queryFn: () => getSuppliers(companyId),
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

  const onSubmit = async (data: ExpenseInput) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(data.requiresApproval ? '/approvals' : '/expenses');
    }, 500);
  };

  return (
    <AppShell title={t('addExpense')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <SelectField
            label={t('category')}
            required
            options={categories?.map((c) => ({ value: c.name_en, label: c.name_en })) ?? [{ value: 'Other', label: 'Other' }]}
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
          <FormInput label={t('date')} type="date" required {...register('transactionDate')} />
          <TextAreaField label={t('notes')} {...register('notes')} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('requiresApproval')} className="rounded" />
            {t('requiresApproval')}
          </label>
          <PremiumButton type="submit" loading={loading} className="w-full">{t('submit')}</PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
