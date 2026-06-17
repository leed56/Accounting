'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { PremiumButton, ConfirmModal } from '@/components/premium-button';
import { StatusBadge } from '@/components/status-badge';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getLeaveRequests, getStaff, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useState } from 'react';

export default function LeavePage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [confirm, setConfirm] = useState<{ action: 'approve' | 'reject'; id: string } | null>(null);

  const { data: requests } = useQuery({
    queryKey: queryKeys.leaveRequests(companyId),
    queryFn: () => getLeaveRequests(companyId),
  });

  const { data: staff } = useQuery({
    queryKey: queryKeys.staff(companyId),
    queryFn: () => getStaff(companyId),
  });

  const filtered = requests?.filter((r) => r.status === tab) ?? [];

  return (
    <AppShell title={t('leave')}>
      <div className="space-y-6">
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize min-h-[44px] ${tab === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {t(s === 'pending' ? 'pending' : s === 'approved' ? 'approved' : 'rejected')}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {filtered.map((lr) => {
            const member = staff?.find((s) => s.id === lr.staff_id);
            return (
              <div key={lr.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{member?.full_name}</p>
                    <p className="text-sm text-gray-500">{lr.leave_type} · {lr.start_date} to {lr.end_date}</p>
                    <p className="text-sm text-gray-600 mt-2">{lr.reason}</p>
                  </div>
                  <StatusBadge status={lr.status} />
                </div>
                {tab === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <PremiumButton size="sm" onClick={() => setConfirm({ action: 'approve', id: lr.id })}>{t('approve')}</PremiumButton>
                    <PremiumButton size="sm" variant="danger" onClick={() => setConfirm({ action: 'reject', id: lr.id })}>{t('reject')}</PremiumButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === 'approve' ? t('approve') : t('reject')}
        message="Are you sure?"
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        onConfirm={() => setConfirm(null)}
        onCancel={() => setConfirm(null)}
        variant={confirm?.action === 'reject' ? 'danger' : 'primary'}
      />
    </AppShell>
  );
}
