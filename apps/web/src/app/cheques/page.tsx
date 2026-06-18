'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { PremiumButton } from '@/components/premium-button';
import { EmptyState } from '@/components/empty-state';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import {
  getPendingCheques,
  queryKeys,
  SAMPLE_COMPANY_ID,
  updateChequeStatus,
} from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { FileText } from 'lucide-react';

export default function ChequesPage() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: cheques, isLoading } = useQuery({
    queryKey: queryKeys.pendingCheques(companyId),
    queryFn: () => getPendingCheques(companyId),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'cleared' | 'bounced' }) =>
      updateChequeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingCheques(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(companyId) });
      toast(t('success'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('cheques')}>
      <div className="space-y-4 max-w-3xl">
        <p className="text-sm text-gray-500">{t('pendingCheques')}</p>
        {isLoading ? (
          <p className="text-sm text-gray-500">{t('loading')}</p>
        ) : cheques?.length ? (
          cheques.map((tx) => (
            <div key={tx.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{formatCurrency(Number(tx.amount))}</p>
                <p className="text-sm text-gray-500">
                  {tx.cheque_number ?? '—'} · {tx.transaction_date} · {tx.category}
                </p>
              </div>
              <div className="flex gap-2">
                <PremiumButton
                  size="sm"
                  variant="secondary"
                  loading={mutation.isPending}
                  onClick={() => mutation.mutate({ id: tx.id, status: 'cleared' })}
                >
                  {t('markChequeCleared')}
                </PremiumButton>
                <PremiumButton
                  size="sm"
                  variant="danger"
                  loading={mutation.isPending}
                  onClick={() => mutation.mutate({ id: tx.id, status: 'bounced' })}
                >
                  {t('markChequeBounced')}
                </PremiumButton>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title={t('pendingCheques')}
            description="No pending cheques right now."
          />
        )}
      </div>
    </AppShell>
  );
}
