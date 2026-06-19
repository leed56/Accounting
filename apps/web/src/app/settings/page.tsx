'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsSchema, inviteSchema, type SettingsInput, type InviteInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { LanguageSwitcher, useTranslation } from '@/components/language-switcher';
import { SummaryCard } from '@/components/metric-card';
import { ExpenseCategoriesManager } from '@/components/expense-categories-manager';
import { IncomeCategoriesManager } from '@/components/income-categories-manager';
import { useToast } from '@/components/toast';
import { usePermissions } from '@/hooks/use-permissions';
import { RolePermissionsEditor, jsonToRolePermissions, rolePermissionsToJson } from '@/components/role-permissions-editor';
import { DEFAULT_ROLE_PERMISSIONS, type CompanyRolePermissions } from '@bizmanager/utils';
import { useAppStore } from '@/stores/app-store';
import { ChangePasswordForm } from '@/components/change-password-form';
import { useAuth } from '@/components/auth-provider';
import { BUSINESS_TYPE_LABEL_KEYS } from '@bizmanager/utils';
import { formatSubscriptionLabel, isSuperAdminEmail } from '@/lib/admin';
import Link from 'next/link';
import {
  getTeamMembers,
  getCompany,
  getSession,
  updateCompany,
  queryKeys,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';

export default function SettingsPage() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const darkMode = useAppStore((s) => s.darkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useAppStore((s) => s.setNotificationPrefs);
  const { canManageSettings, canInvite } = usePermissions();
  const { profile } = useAuth();
  const [inviteLoading, setInviteLoading] = useState(false);
  const [lastTempPassword, setLastTempPassword] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<CompanyRolePermissions>(
    structuredClone(DEFAULT_ROLE_PERMISSIONS)
  );

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const { data: teamMembers, refetch: refetchTeam } = useQuery({
    queryKey: queryKeys.teamMembers(companyId),
    queryFn: () => getTeamMembers(companyId),
  });

  const { register, handleSubmit, reset } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: 'Royal Travels Office',
      ownerName: 'Kasun Perera',
      currency: 'LKR',
      defaultLanguage: 'en',
      taxEnabled: false,
      vatRate: 18,
      ssclEnabled: false,
      ssclRate: 2.5,
      serviceChargeRate: 0,
      approvalAutoLimit: 5000,
      staffModuleEnabled: true,
    },
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        ownerName: company.owner_name ?? '',
        currency: company.currency,
        defaultLanguage: (company.default_language as 'en' | 'si' | 'ta') || 'en',
        taxEnabled: company.tax_enabled,
        vatRate: company.vat_rate,
        ssclEnabled: company.sscl_enabled,
        ssclRate: company.sscl_rate,
        serviceChargeRate: company.service_charge_rate,
        approvalAutoLimit: company.approval_auto_limit,
        staffModuleEnabled: company.staff_module_enabled,
      });
      setRolePermissions(jsonToRolePermissions(company.role_permissions));
    }
  }, [company, reset]);

  const saveMutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.company(companyId) });
      toast(t('success'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const inviteForm = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'manager' },
  });

  const onInvite = inviteForm.handleSubmit(async (data) => {
    setInviteLoading(true);
    setLastTempPassword(null);
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Invite failed');

      if (json.tempPassword) setLastTempPassword(json.tempPassword);
      toast(json.message ?? (json.emailSent ? t('inviteEmailSent') : t('inviteSent')), 'success');
      inviteForm.reset({ email: '', fullName: '', role: 'manager' });
      refetchTeam();
    } catch (e) {
      toast(e instanceof Error ? e.message : t('error'), 'error');
    } finally {
      setInviteLoading(false);
    }
  });

  return (
    <AppShell title={t('settings')}>
      <form onSubmit={handleSubmit((d) => saveMutation.mutate({
        ...d,
        rolePermissions: rolePermissionsToJson(rolePermissions),
      }))} className="max-w-2xl space-y-6">
        <SummaryCard title={t('businessProfile')}>
          <div className="space-y-4">
            <FormInput label={t('businessName')} {...register('name')} />
            <FormInput label={t('ownerName')} {...register('ownerName')} />
            {company?.business_type && (
              <p className="text-sm text-gray-500">
                {t('businessTypeLabel')}: {t(BUSINESS_TYPE_LABEL_KEYS[company.business_type])}
              </p>
            )}
            <FormInput label={t('currency')} {...register('currency')} />
            <div>
              <label className="label">{t('languagePreference')}</label>
              <LanguageSwitcher />
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title={t('expenseCategories')}>
          <ExpenseCategoriesManager companyId={companyId} canEdit={canManageSettings} />
        </SummaryCard>

        <SummaryCard title={t('incomeCategories')}>
          <IncomeCategoriesManager companyId={companyId} canEdit={canManageSettings} />
        </SummaryCard>

        <SummaryCard title={t('rolePermissions')}>
          <RolePermissionsEditor
            value={rolePermissions}
            onChange={setRolePermissions}
            disabled={!canManageSettings}
          />
        </SummaryCard>

        <SummaryCard title={t('userRoles')}>
          <div className="space-y-3 mb-4">
            {teamMembers?.map((member) => (
              <div key={member.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium">{member.full_name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <span className="text-xs uppercase tracking-wide text-primary font-semibold">{member.role}</span>
              </div>
            ))}
          </div>

          {canInvite ? (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">{t('inviteUserDesc')}</p>
              <FormInput label={t('email')} required {...inviteForm.register('email')} />
              <FormInput label={t('fullName')} required {...inviteForm.register('fullName')} />
              <SelectField
                label={t('role')}
                options={[
                  { value: 'manager', label: t('roleManager') },
                  { value: 'accountant', label: t('roleAccountant') },
                  { value: 'staff', label: t('roleStaff') },
                ]}
                {...inviteForm.register('role')}
              />
              <PremiumButton type="button" loading={inviteLoading} variant="secondary" onClick={onInvite}>
                {t('inviteUser')}
              </PremiumButton>
              {lastTempPassword && (
                <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                  Temporary password: <strong>{lastTempPassword}</strong> — share securely with the new user.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('noInvitePermission')}</p>
          )}
        </SummaryCard>

        <SummaryCard title={t('notificationPreferences')}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notificationPrefs.notifyApprovals}
                onChange={(e) => setNotificationPrefs({ notifyApprovals: e.target.checked })}
                className="rounded"
              />
              {t('notifyApprovals')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notificationPrefs.notifyPayroll}
                onChange={(e) => setNotificationPrefs({ notifyPayroll: e.target.checked })}
                className="rounded"
              />
              {t('notifyPayroll')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notificationPrefs.notifyLeave}
                onChange={(e) => setNotificationPrefs({ notifyLeave: e.target.checked })}
                className="rounded"
              />
              {t('notifyLeave')}
            </label>
          </div>
        </SummaryCard>

        <SummaryCard title={t('appearance')}>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="rounded"
            />
            {t('darkMode')}
          </label>
        </SummaryCard>

        <SummaryCard title={t('taxSettings')}>
          <p className="text-sm text-gray-500 mb-4">{t('taxDisclaimer')}</p>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('taxEnabled')} className="rounded" />
              {t('enableTax')}
            </label>
            <FormInput label="VAT Rate (%)" type="number" {...register('vatRate')} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('ssclEnabled')} className="rounded" />
              SSCL Enabled
            </label>
            <FormInput label="SSCL Rate (%)" type="number" {...register('ssclRate')} />
          </div>
        </SummaryCard>

        <SummaryCard title={t('approvalLimits')}>
          <FormInput label="Auto-approve below (Rs.)" type="number" {...register('approvalAutoLimit')} />
        </SummaryCard>

        <SummaryCard title={t('subscription')}>
          <p className="text-sm text-gray-600">
            {company
              ? formatSubscriptionLabel(
                  company.subscription_plan ?? 'trial',
                  company.trial_ends_at ?? null,
                  company.max_users ?? 3
                )
              : 'Free trial · Small Office plan (up to 3 users)'}
          </p>
        </SummaryCard>

        <SummaryCard title={t('password')}>
          <ChangePasswordForm />
        </SummaryCard>

        {isSuperAdminEmail(profile?.email) && (
          <SummaryCard title={t('adminPanel')}>
            <Link href="/admin" className="text-sm text-primary font-medium hover:underline">
              {t('adminPanel')} →
            </Link>
          </SummaryCard>
        )}

        <PremiumButton type="submit" loading={saveMutation.isPending} disabled={!canManageSettings}>
          {t('save')}
        </PremiumButton>
        {!canManageSettings && (
          <p className="text-sm text-gray-500">{t('noSettingsPermission')}</p>
        )}
      </form>
    </AppShell>
  );
}
