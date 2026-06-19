'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockAdjustmentSchema, type StockAdjustmentInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import {
  adjustStock,
  getProducts,
  getStockMovements,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [showAdjust, setShowAdjust] = useState(false);

  const { data: products } = useQuery({
    queryKey: queryKeys.products(companyId),
    queryFn: () => getProducts(companyId),
  });

  const product = products?.find((p) => p.id === id);

  const { data: movements } = useQuery({
    queryKey: queryKeys.stockMovements(id),
    queryFn: () => getStockMovements(id),
    enabled: !!id,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { productId: id, movementType: 'in', quantity: 1 },
  });

  const mutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products(companyId) });
      toast(t('success'), 'success');
      setShowAdjust(false);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (!product) {
    return (
      <AppShell title={t('inventory')}>
        <p className="text-gray-500">{t('loading')}</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={product.name}>
      <div className="space-y-6 max-w-2xl">
        <Link href="/inventory" className="text-sm text-primary">← {t('inventory')}</Link>
        <div className="card">
          <p className="text-3xl font-bold">{product.quantity_on_hand} {product.unit}</p>
          <p className="text-sm text-gray-500 mt-2">
            Cost {formatCurrency(product.cost_price)} · Sale {formatCurrency(product.sale_price)}
          </p>
          <PremiumButton className="mt-4" onClick={() => setShowAdjust(!showAdjust)}>
            {t('adjustStock')}
          </PremiumButton>
        </div>

        {showAdjust && (
          <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, productId: id }))} className="card space-y-4">
            <SelectField
              label={t('movementType')}
              options={[
                { value: 'in', label: t('stockIn') },
                { value: 'out', label: t('stockOut') },
                { value: 'adjustment', label: t('adjustment') },
              ]}
              {...register('movementType')}
            />
            <FormInput label="Quantity" type="number" required error={errors.quantity?.message} {...register('quantity')} />
            <TextAreaField label={t('notes')} {...register('notes')} />
            <PremiumButton type="submit" loading={mutation.isPending}>{t('save')}</PremiumButton>
          </form>
        )}

        <div className="card">
          <h3 className="font-semibold mb-3">{t('stockMovements')}</h3>
          {movements?.map((m) => (
            <div key={m.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
              <span>{m.movement_type} · {m.quantity}</span>
              <span className="text-gray-500">{new Date(m.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {!movements?.length && <p className="text-sm text-gray-500">{t('noRecentActivity')}</p>}
        </div>
      </div>
    </AppShell>
  );
}
