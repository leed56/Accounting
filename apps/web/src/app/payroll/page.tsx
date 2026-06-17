'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { PremiumButton } from '@/components/premium-button';
import { StatusBadge } from '@/components/status-badge';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getPayrollRuns, getStaff, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency, getMonthName } from '@bizmanager/utils';

export default function PayrollPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: payrollRuns } = useQuery({
    queryKey: queryKeys.payrollRuns(companyId),
    queryFn: () => getPayrollRuns(companyId),
  });

  const { data: staff } = useQuery({
    queryKey: queryKeys.staff(companyId),
    queryFn: () => getStaff(companyId),
  });

  const run = payrollRuns?.[0];

  return (
    <AppShell title={t('payroll')}>
      <div className="space-y-6">
        {run && (
          <div className="card bg-primary-light/30 border-primary/20">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getMonthName(run.month)} {run.year} Payroll
                </h3>
                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(run.total_payable)}</p>
              </div>
              <StatusBadge status={run.status} />
            </div>
            <div className="flex gap-2 mt-4">
              <PremiumButton size="sm">{t('submitForApproval')}</PremiumButton>
            </div>
          </div>
        )}

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-3 pr-4">Staff</th>
                <th className="py-3 pr-4">{t('basicSalary')}</th>
                <th className="py-3 pr-4">EPF</th>
                <th className="py-3 pr-4">{t('deductions')}</th>
                <th className="py-3">{t('netPayable')}</th>
              </tr>
            </thead>
            <tbody>
              {staff?.map((s) => {
                const epf = s.basic_salary * 0.08;
                const net = s.basic_salary - epf;
                return (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium">{s.full_name}</td>
                    <td className="py-3 pr-4">{formatCurrency(s.basic_salary)}</td>
                    <td className="py-3 pr-4">{formatCurrency(epf)}</td>
                    <td className="py-3 pr-4">—</td>
                    <td className="py-3 font-semibold">{formatCurrency(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PremiumButton>{t('generateSalary')}</PremiumButton>
      </div>
    </AppShell>
  );
}
