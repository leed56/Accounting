'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settlementRunSchema, type SettlementRunInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import {
  createSettlementRun,
  getSuppliers,
  getAccounts,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { toISODate, formatCurrency } from '@bizmanager/utils';
import { Plus, Trash2 } from 'lucide-react';

export default function BatchSettlementPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: suppliers } = useQuery({
    queryKey: queryKeys.suppliers(companyId),
    queryFn: () => getSuppliers(companyId),
  });

  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts(companyId),
    queryFn: () => getAccounts(companyId),
  });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<SettlementRunInput>({
    resolver: zodResolver(settlementRunSchema),
    defaultValues: {
      runDate: toISODate(),
      items: [{ supplierId: '', amount: 0, notes: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const total = items?.reduce((s, i) => s + Number(i.amount || 0), 0) ?? 0;

  useEffect(() => {
    const vendorId = searchParams.get('vendor');
    if (vendorId && suppliers?.length) {
      const vendor = suppliers.find((s) => s.id === vendorId);
      if (vendor) {
        reset({
          runDate: toISODate(),
          items: [{ supplierId: vendor.id, amount: vendor.current_balance, notes: '' }],
        });
      }
    }
  }, [searchParams, suppliers, reset]);

  const mutation = useMutation({
    mutationFn: createSettlementRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(companyId, 'daily') });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlementRuns(companyId) });
      toast(t('success'), 'success');
      router.push('/suppliers');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('batchSettlement')}>
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <FormInput label={t('date')} type="date" required {...register('runDate')} />
          <SelectField
            label="Pay from account"
            options={accounts?.map((a) => ({ value: a.id, label: `${a.name} (${formatCurrency(a.current_balance)})` })) ?? []}
            {...register('accountId')}
          />
          <TextAreaField label={t('notes')} {...register('notes')} />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{t('vendors')}</h3>
              <PremiumButton type="button" variant="secondary" onClick={() => append({ supplierId: '', amount: 0, notes: '' })}>
                <Plus className="h-4 w-4" /> Add line
              </PremiumButton>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                <div className="sm:col-span-5">
                  <SelectField
                    label={t('vendor')}
                    required
                    options={[
                      { value: '', label: '— Select —' },
                      ...(suppliers?.map((s) => ({
                        value: s.id,
                        label: `${s.name} (${formatCurrency(s.current_balance)})`,
                      })) ?? []),
                    ]}
                    error={errors.items?.[index]?.supplierId?.message}
                    {...register(`items.${index}.supplierId`)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <FormInput
                    label={t('amount')}
                    type="number"
                    required
                    error={errors.items?.[index]?.amount?.message}
                    {...register(`items.${index}.amount`)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <FormInput label={t('notes')} {...register(`items.${index}.notes`)} />
                </div>
                <div className="sm:col-span-1 pt-6">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="text-expense p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {errors.items?.message && <p className="text-sm text-expense">{errors.items.message}</p>}
          </div>

          <p className="text-lg font-bold">{t('total')}: {formatCurrency(total)}</p>

          <PremiumButton type="submit" loading={mutation.isPending} className="w-full">
            {t('processSettlement')}
          </PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
