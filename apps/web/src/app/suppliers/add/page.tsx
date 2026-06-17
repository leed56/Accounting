'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierSchema, type SupplierInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { createSupplier, queryKeys } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';

export default function AddSupplierPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId);

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { openingBalance: 0 },
  });

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      if (companyId) queryClient.invalidateQueries({ queryKey: queryKeys.suppliers(companyId) });
      toast(t('success'), 'success');
      router.push('/suppliers');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('addSupplier')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <FormInput label="Supplier name" required error={errors.name?.message} {...register('name')} />
          <FormInput label="Phone" {...register('phone')} />
          <FormInput label={t('email')} type="email" {...register('email')} />
          <TextAreaField label="Address" {...register('address')} />
          <FormInput label="Opening balance (Rs.)" type="number" {...register('openingBalance')} />
          <PremiumButton type="submit" loading={mutation.isPending} className="w-full">
            {t('save')}
          </PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
