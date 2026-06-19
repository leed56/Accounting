'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bankStatementLineSchema, type BankStatementLineInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import {
  addBankStatementLine,
  closeBankReconciliation,
  getBankReconciliations,
  getBankStatementLines,
  getTransactions,
  matchBankLine,
  queryKeys,
} from '@bizmanager/supabase-client';
import { formatCurrency, toISODate } from '@bizmanager/utils';
import Link from 'next/link';
import { useAppStore } from '@/stores/app-store';

export default function BankReconciliationDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId)!;

  const { data: recons } = useQuery({
    queryKey: queryKeys.bankReconciliations(companyId),
    queryFn: () => getBankReconciliations(companyId),
  });
  const recon = recons?.find((r) => r.id === id);

  const { data: lines } = useQuery({
    queryKey: queryKeys.bankStatementLines(id),
    queryFn: () => getBankStatementLines(id),
    enabled: !!id,
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions(companyId, { limit: '50' }),
    queryFn: () => getTransactions(companyId, { limit: 50 }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BankStatementLineInput>({
    resolver: zodResolver(bankStatementLineSchema),
    defaultValues: { lineDate: toISODate(), amount: 0 },
  });

  const addLine = useMutation({
    mutationFn: (input: BankStatementLineInput) => addBankStatementLine(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankStatementLines(id) });
      reset({ lineDate: toISODate(), amount: 0, description: '', reference: '' });
      toast(t('success'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const closeRecon = useMutation({
    mutationFn: () => closeBankReconciliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankReconciliations(companyId) });
      toast(t('success'), 'success');
    },
  });

  const matchLine = useMutation({
    mutationFn: ({ lineId, txId }: { lineId: string; txId: string }) => matchBankLine(lineId, txId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bankStatementLines(id) }),
  });

  if (!recon) {
    return (
      <AppShell title={t('bankReconciliation')}>
        <p className="text-gray-500">{t('loading')}</p>
      </AppShell>
    );
  }

  const matched = lines?.filter((l) => l.is_matched).length ?? 0;

  return (
    <AppShell title={`${t('bankReconciliation')} — ${recon.statement_date}`}>
      <div className="space-y-6 max-w-3xl">
        <Link href="/bank-reconciliation" className="text-sm text-primary">← Back</Link>

        <div className="card grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">{t('openingBalance')}</p><p className="font-semibold">{formatCurrency(recon.opening_balance)}</p></div>
          <div><p className="text-gray-500">{t('closingBalance')}</p><p className="font-semibold">{formatCurrency(recon.closing_balance)}</p></div>
          <div><p className="text-gray-500">{t('matched')}</p><p className="font-semibold">{matched}/{lines?.length ?? 0}</p></div>
          <div><p className="text-gray-500">{t('status')}</p><p className="font-semibold capitalize">{recon.status}</p></div>
        </div>

        {recon.status === 'open' && (
          <>
            <form onSubmit={handleSubmit((d) => addLine.mutate(d))} className="card space-y-3">
              <h3 className="font-semibold">{t('addStatementLine')}</h3>
              <FormInput label={t('date')} type="date" required {...register('lineDate')} />
              <FormInput label={t('amount')} type="number" required error={errors.amount?.message} {...register('amount')} />
              <TextAreaField label={t('description')} {...register('description')} />
              <FormInput label={t('reference')} {...register('reference')} />
              <PremiumButton type="submit" loading={addLine.isPending}>{t('add')}</PremiumButton>
            </form>

            <PremiumButton variant="secondary" onClick={() => closeRecon.mutate()} loading={closeRecon.isPending}>
              {t('closeReconciliation')}
            </PremiumButton>
          </>
        )}

        <div className="card space-y-3">
          <h3 className="font-semibold">{t('statementLines')}</h3>
          {lines?.map((line) => (
            <div key={line.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span>{line.line_date} · {line.description || '—'}</span>
                <span className={Number(line.amount) >= 0 ? 'text-income' : 'text-expense'}>
                  {formatCurrency(line.amount)}
                </span>
              </div>
              {line.is_matched ? (
                <p className="text-xs text-green-600 mt-1">{t('matched')}</p>
              ) : recon.status === 'open' && (
                <select
                  className="input-field mt-2 text-sm"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) matchLine.mutate({ lineId: line.id, txId: e.target.value });
                  }}
                >
                  <option value="">{t('matchTransaction')}</option>
                  {transactions?.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.transaction_date} · {tx.category} · {formatCurrency(tx.amount)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          {!lines?.length && <p className="text-sm text-gray-500">{t('noStatementLines')}</p>}
        </div>
      </div>
    </AppShell>
  );
}
