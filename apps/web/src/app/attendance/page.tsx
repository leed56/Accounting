'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { SummaryCard } from '@/components/metric-card';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getStaff, getAttendance, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { toISODate } from '@bizmanager/utils';
import { cn } from '@/lib/utils';

const statuses = ['present', 'absent', 'half_day', 'late', 'leave'] as const;

export default function AttendancePage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [date, setDate] = useState(toISODate());
  const [records, setRecords] = useState<Record<string, string>>({});

  const { data: staff } = useQuery({
    queryKey: queryKeys.staff(companyId),
    queryFn: () => getStaff(companyId),
  });

  const { data: attendance } = useQuery({
    queryKey: queryKeys.attendance(companyId, date),
    queryFn: () => getAttendance(companyId, date),
  });

  const getStatus = (staffId: string) =>
    records[staffId] ?? attendance?.find((a) => a.staff_id === staffId)?.status ?? 'present';

  return (
    <AppShell title={t('attendance')}>
      <div className="space-y-6 max-w-3xl">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field max-w-xs"
        />
        <SummaryCard title={t('attendance')}>
          {staff?.map((s) => (
            <div key={s.id} className="py-4 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900 mb-2">{s.full_name}</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => setRecords((r) => ({ ...r, [s.id]: st }))}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium capitalize min-h-[36px]',
                      getStatus(s.id) === st
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </SummaryCard>
        <PremiumButton className="w-full sm:w-auto">{t('saveAttendance')}</PremiumButton>
      </div>
    </AppShell>
  );
}
