'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { PremiumButton } from '@/components/premium-button';
import { StatusBadge } from '@/components/status-badge';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAuth } from '@/components/auth-provider';
import { useAppStore } from '@/stores/app-store';
import {
  generatePayrollRun,
  submitPayrollRun,
  approvePayrollRun,
  markPayrollPaid,
  getPayrollRuns,
  getPayrollItems,
  getCompany,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { formatCurrency, getMonthName } from '@bizmanager/utils';
import { downloadPayslipPdf, buildPayslipWhatsAppMessage } from '@/lib/export/payslip-pdf';
import { openWhatsAppShare } from '@/lib/export/download';

export default function PayrollPage() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const isOwner = profile?.role === 'owner';

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const { data: payrollRuns } = useQuery({
    queryKey: queryKeys.payrollRuns(companyId),
    queryFn: () => getPayrollRuns(companyId),
  });

  const run = payrollRuns?.[0];

  const { data: payrollItems } = useQuery({
    queryKey: queryKeys.payrollItems(run?.id ?? 'none'),
    queryFn: () => getPayrollItems(run!.id),
    enabled: !!run?.id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.payrollRuns(companyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.paymentRequests(companyId) });
    if (run?.id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrollItems(run.id) });
    }
  };

  const generateMutation = useMutation({
    mutationFn: () => generatePayrollRun(),
    onSuccess: () => {
      invalidate();
      toast('Payroll generated', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitPayrollRun(run!.id),
    onSuccess: () => {
      invalidate();
      toast('Submitted for approval', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const approveMutation = useMutation({
    mutationFn: () => approvePayrollRun(run!.id),
    onSuccess: () => {
      invalidate();
      toast(t('approved'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const paidMutation = useMutation({
    mutationFn: () => markPayrollPaid(run!.id),
    onSuccess: () => {
      invalidate();
      toast(t('paid'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const companyName = company?.name ?? 'BizManager';

  const handlePayslipPdf = (item: NonNullable<typeof payrollItems>[number]) => {
    if (!run) return;
    downloadPayslipPdf({
      companyName,
      month: run.month,
      year: run.year,
      staff: item.staff,
      item,
    });
  };

  const handlePayslipWhatsApp = (item: NonNullable<typeof payrollItems>[number]) => {
    if (!run) return;
    const message = buildPayslipWhatsAppMessage({
      companyName,
      month: run.month,
      year: run.year,
      staff: item.staff,
      item,
    });
    openWhatsAppShare(message, item.staff.phone);
  };

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
            <div className="flex flex-wrap gap-2 mt-4">
              {run.status === 'draft' && (
                <PremiumButton size="sm" loading={submitMutation.isPending} onClick={() => submitMutation.mutate()}>
                  {t('submitForApproval')}
                </PremiumButton>
              )}
              {run.status === 'submitted' && isOwner && (
                <PremiumButton size="sm" loading={approveMutation.isPending} onClick={() => approveMutation.mutate()}>
                  {t('approve')}
                </PremiumButton>
              )}
              {run.status === 'approved' && isOwner && (
                <PremiumButton size="sm" loading={paidMutation.isPending} onClick={() => paidMutation.mutate()}>
                  {t('markAsPaidSalary')}
                </PremiumButton>
              )}
            </div>
          </div>
        )}

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-3 pr-4">Staff</th>
                <th className="py-3 pr-4">{t('basicSalary')}</th>
                <th className="py-3 pr-4">EPF (8%)</th>
                <th className="py-3 pr-4">{t('netPayable')}</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(payrollItems ?? []).map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium">{item.staff.full_name}</td>
                  <td className="py-3 pr-4">{formatCurrency(item.basic_salary)}</td>
                  <td className="py-3 pr-4">{formatCurrency(item.epf_employee)}</td>
                  <td className="py-3 pr-4 font-semibold">{formatCurrency(item.net_payable)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <PremiumButton size="sm" variant="secondary" onClick={() => handlePayslipPdf(item)}>
                        PDF
                      </PremiumButton>
                      <PremiumButton size="sm" variant="secondary" onClick={() => handlePayslipWhatsApp(item)}>
                        WhatsApp
                      </PremiumButton>
                    </div>
                  </td>
                </tr>
              ))}
              {!payrollItems?.length && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Generate payroll to see staff payslips
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PremiumButton loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
          {t('generateSalary')}
        </PremiumButton>
      </div>
    </AppShell>
  );
}
