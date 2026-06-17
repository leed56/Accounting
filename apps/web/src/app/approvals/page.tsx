'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { ApprovalCard } from '@/components/approval-card';
import { EmptyState } from '@/components/empty-state';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getPaymentRequests, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { CheckSquare } from 'lucide-react';

export default function ApprovalsPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const { data: requests } = useQuery({
    queryKey: queryKeys.paymentRequests(companyId),
    queryFn: () => getPaymentRequests(companyId),
  });

  const filtered = requests?.filter((r) => r.status === tab) ?? [];
  const pendingTotal = requests?.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0) ?? 0;

  return (
    <AppShell title={t('approvals')}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard label={t('pendingApprovals')} value={String(filtered.length)} variant="warning" />
          <MetricCard label="Total Pending" value={formatCurrency(pendingTotal)} variant="expense" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize min-h-[44px] ${tab === s ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <ApprovalCard key={r.id} request={r} />
          ))}
        </div>

        {!filtered.length && (
          <EmptyState icon={<CheckSquare className="h-8 w-8" />} title={t('noApprovals')} description={t('noApprovalsDesc')} />
        )}
      </div>
    </AppShell>
  );
}
