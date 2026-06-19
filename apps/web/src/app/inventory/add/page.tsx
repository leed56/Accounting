'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productSchema, type ProductInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import { createProduct, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';

export default function AddProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { register, handleSubmit, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { unit: 'pcs', costPrice: 0, salePrice: 0, quantityOnHand: 0, reorderLevel: 5 },
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(companyId) });
      toast(t('success'), 'success');
      router.push('/inventory');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('addProduct')}>
      <div className="max-w-xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <FormInput label={t('productName')} required error={errors.name?.message} {...register('name')} />
          <FormInput label="SKU" {...register('sku')} />
          <FormInput label={t('unit')} {...register('unit')} />
          <FormInput label={t('costPrice')} type="number" {...register('costPrice')} />
          <FormInput label={t('salePrice')} type="number" {...register('salePrice')} />
          <FormInput label={t('quantityOnHand')} type="number" {...register('quantityOnHand')} />
          <FormInput label={t('reorderLevel')} type="number" {...register('reorderLevel')} />
          <PremiumButton type="submit" loading={mutation.isPending} className="w-full">{t('save')}</PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
