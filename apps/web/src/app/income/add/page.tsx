'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeSchema, type IncomeInput } from '@bizmanager/types';
import { PAYMENT_METHODS } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { toISODate } from '@bizmanager/utils';

export default function AddIncomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [loading, setLoading] = useState(false);

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers(companyId),
    queryFn: () => getCustomers(companyId),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      paymentMethod: 'cash',
      transactionDate: toISODate(),
      markAsPaid: true,
    },
  });

  const onSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/income');
    }, 500);
  };

  return (
    <AppShell title={t('addIncome')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
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
          <FormInput label={t('date')} type="date" required {...register('transactionDate')} />
          <TextAreaField label={t('notes')} {...register('notes')} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('markAsPaid')} className="rounded" />
            {t('markAsPaid')}
          </label>
          <PremiumButton type="submit" loading={loading} className="w-full">{t('save')}</PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
