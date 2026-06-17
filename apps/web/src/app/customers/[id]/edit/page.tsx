'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerUpdateSchema, type CustomerUpdateInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { getCustomer, updateCustomer, queryKeys } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency } from '@bizmanager/utils';

export default function EditCustomerPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId);

  const { data: customer, isLoading } = useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerUpdateInput>({
    resolver: zodResolver(customerUpdateSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        address: customer.address ?? '',
      });
    }
  }, [customer, reset]);

  const mutation = useMutation({
    mutationFn: (data: CustomerUpdateInput) => updateCustomer(id, data),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.customers(companyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.customer(id) });
      }
      toast(t('success'), 'success');
      router.push('/customers');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (isLoading || !customer) {
    return (
      <AppShell title={t('edit')}>
        <p className="text-gray-500">{t('loading')}</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={t('edit')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <p className="text-sm text-gray-500">
            Balance: <span className="font-semibold text-income">{formatCurrency(customer.current_balance)}</span>
          </p>
          <FormInput label={t('customer')} required error={errors.name?.message} {...register('name')} />
          <FormInput label="Phone" {...register('phone')} />
          <FormInput label={t('email')} type="email" {...register('email')} />
          <TextAreaField label="Address" {...register('address')} />
          <div className="flex gap-3">
            <PremiumButton type="button" variant="secondary" onClick={() => router.back()}>
              {t('cancel')}
            </PremiumButton>
            <PremiumButton type="submit" loading={mutation.isPending} className="flex-1">
              {t('save')}
            </PremiumButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
