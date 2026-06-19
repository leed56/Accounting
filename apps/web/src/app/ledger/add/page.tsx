'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journalEntrySchema, type JournalEntryInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import { createJournalEntry, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { toISODate, formatCurrency } from '@bizmanager/utils';
import { Plus, Trash2 } from 'lucide-react';

const ACCOUNT_CODES = ['cash', 'bank', 'receivables', 'payables', 'income', 'expense', 'equity'];

export default function AddJournalEntryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<JournalEntryInput>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      entryDate: toISODate(),
      description: '',
      lines: [
        { accountCode: 'cash', debit: 0, credit: 0 },
        { accountCode: 'income', debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = watch('lines');
  const totalDebit = lines?.reduce((s, l) => s + Number(l.debit || 0), 0) ?? 0;
  const totalCredit = lines?.reduce((s, l) => s + Number(l.credit || 0), 0) ?? 0;
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const mutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries(companyId) });
      toast(t('success'), 'success');
      router.push('/ledger');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('addJournalEntry')}>
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <FormInput label={t('date')} type="date" required {...register('entryDate')} />
          <FormInput label={t('reference')} {...register('reference')} />
          <TextAreaField label={t('description')} required error={errors.description?.message} {...register('description')} />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{t('journalLines')}</h3>
              <PremiumButton type="button" variant="secondary" onClick={() => append({ accountCode: 'expense', debit: 0, credit: 0 })}>
                <Plus className="h-4 w-4" />
              </PremiumButton>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end border rounded-lg p-3">
                <div className="col-span-4">
                  <label className="label text-xs">{t('account')}</label>
                  <select className="input-field" {...register(`lines.${index}.accountCode`)}>
                    {ACCOUNT_CODES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <FormInput label={t('debit')} type="number" {...register(`lines.${index}.debit`)} />
                </div>
                <div className="col-span-3">
                  <FormInput label={t('credit')} type="number" {...register(`lines.${index}.credit`)} />
                </div>
                <div className="col-span-2">
                  {fields.length > 2 && (
                    <button type="button" onClick={() => remove(index)} className="text-expense p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm">
            <span>{t('debit')}: {formatCurrency(totalDebit)}</span>
            <span>{t('credit')}: {formatCurrency(totalCredit)}</span>
          </div>
          {!balanced && <p className="text-sm text-expense">{t('journalMustBalance')}</p>}

          <PremiumButton type="submit" loading={mutation.isPending} disabled={!balanced} className="w-full">
            {t('save')}
          </PremiumButton>
        </form>
      </div>
    </AppShell>
  );
}
