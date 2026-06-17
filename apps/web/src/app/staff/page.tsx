'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard, SummaryCard } from '@/components/metric-card';
import { InsightCard } from '@/components/insight-card';
import { AttendanceBarChart, ChartCard } from '@/components/charts';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import {
  getStaff,
  getLeaveRequests,
  getPayrollRuns,
  getAttendance,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { formatCurrency, toISODate } from '@bizmanager/utils';
import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';

export default function StaffPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const today = toISODate();

  const { data: staff } = useQuery({
    queryKey: queryKeys.staff(companyId),
    queryFn: () => getStaff(companyId),
  });

  const { data: attendance } = useQuery({
    queryKey: queryKeys.attendance(companyId, today),
    queryFn: () => getAttendance(companyId, today),
  });

  const { data: leaveRequests } = useQuery({
    queryKey: queryKeys.leaveRequests(companyId, 'pending'),
    queryFn: () => getLeaveRequests(companyId, 'pending'),
  });

  const { data: payrollRuns } = useQuery({
    queryKey: queryKeys.payrollRuns(companyId),
    queryFn: () => getPayrollRuns(companyId),
  });

  const present = attendance?.filter((a) => a.status === 'present' || a.status === 'late').length ?? 0;
  const absent = attendance?.filter((a) => a.status === 'absent' || a.status === 'leave').length ?? 0;

  return (
    <AppShell title={t('staff')}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Staff" value={String(staff?.length ?? 0)} />
          <MetricCard label={t('staffPresent')} value={String(present)} variant="income" />
          <MetricCard label={t('staffAbsent')} value={String(absent)} variant="expense" />
          <MetricCard label={t('salary')} value={formatCurrency(payrollRuns?.[0]?.total_payable ?? 275000)} />
        </div>

        <InsightCard
          title={t('aiInsight')}
          message="Staff attendance is lower this week. 2 staff were absent today."
          severity="warning"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Weekly Attendance">
            <AttendanceBarChart />
          </ChartCard>
          <SummaryCard title="Leave Requests">
            {leaveRequests?.map((lr) => {
              const member = staff?.find((s) => s.id === lr.staff_id);
              return (
                <div key={lr.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{member?.full_name ?? 'Staff'}</p>
                    <p className="text-sm text-gray-500">{lr.leave_type} · {lr.days} day(s)</p>
                  </div>
                  <StatusBadge status={lr.status} />
                </div>
              );
            })}
            <Link href="/leave" className="text-sm text-primary font-medium mt-2 inline-block">View all →</Link>
          </SummaryCard>
        </div>

        <SummaryCard title="Team">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staff?.map((s) => {
              const att = attendance?.find((a) => a.staff_id === s.id);
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold">
                    {s.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{s.full_name}</p>
                    <p className="text-sm text-gray-500">{s.role_title}</p>
                  </div>
                  {att && <StatusBadge status={att.status} />}
                </div>
              );
            })}
          </div>
        </SummaryCard>
      </div>
    </AppShell>
  );
}
