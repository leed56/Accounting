'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { InsightCard } from '@/components/insight-card';
import { PremiumButton, ConfirmModal } from '@/components/premium-button';
import { StatusBadge, RiskBadge } from '@/components/status-badge';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getPaymentRequests, getDashboardSummary, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { useState } from 'react';

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  const { data: requests } = useQuery({
    queryKey: queryKeys.paymentRequests(companyId),
    queryFn: () => getPaymentRequests(companyId),
  });

  const { data: summary } = useQuery({
    queryKey: queryKeys.dashboard(companyId, 'daily'),
    queryFn: () => getDashboardSummary(companyId),
  });

  const request = requests?.find((r) => r.id === params.id);
  const afterBalance = (summary?.cashBalance ?? 0) - (request?.amount ?? 0);

  if (!request) {
    return <AppShell title={t('approvals')}><p>Not found</p></AppShell>;
  }

  return (
    <AppShell title={t('approvals')}>
      <div className="max-w-2xl space-y-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 capitalize">{request.request_type}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(request.amount)}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={request.status} />
              <RiskBadge level={request.risk_level} />
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">{t('category')}</dt><dd className="font-medium">{request.category}</dd></div>
            <div><dt className="text-gray-500">Payee</dt><dd className="font-medium">{request.payee_name}</dd></div>
            <div><dt className="text-gray-500">{t('description')}</dt><dd>{request.description}</dd></div>
            <div><dt className="text-gray-500">{t('paymentMethod')}</dt><dd className="capitalize">{request.payment_method}</dd></div>
          </dl>
        </div>

        {request.ai_note && (
          <InsightCard title="AI Note" message={request.ai_note} severity="info" />
        )}

        <div className="card bg-gray-50">
          <p className="text-sm font-medium text-gray-700">{t('balanceImpact')}</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {t('afterApproval', { amount: formatCurrency(afterBalance) })}
          </p>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-3">
            <PremiumButton className="flex-1" onClick={() => setConfirmAction('approve')}>{t('approve')}</PremiumButton>
            <PremiumButton variant="danger" className="flex-1" onClick={() => setConfirmAction('reject')}>{t('reject')}</PremiumButton>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction === 'approve' ? t('approve') : t('reject')}
        message={`${confirmAction === 'approve' ? 'Approve' : 'Reject'} payment of ${formatCurrency(request.amount)}?`}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        onConfirm={() => { setConfirmAction(null); router.push('/approvals'); }}
        onCancel={() => setConfirmAction(null)}
        variant={confirmAction === 'reject' ? 'danger' : 'primary'}
      />
    </AppShell>
  );
}
