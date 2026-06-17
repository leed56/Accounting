'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema, type SettingsInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { LanguageSwitcher, useTranslation } from '@/components/language-switcher';
import { SummaryCard } from '@/components/metric-card';

export default function SettingsPage() {
  const { t } = useTranslation();

  const { register, handleSubmit } = useForm<SettingsInput>({
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

  return (
    <AppShell title={t('settings')}>
      <div className="max-w-2xl space-y-6">
        <SummaryCard title={t('businessProfile')}>
          <form onSubmit={handleSubmit(() => {})} className="space-y-4">
            <FormInput label={t('businessName')} {...register('name')} />
            <FormInput label={t('ownerName')} {...register('ownerName')} />
            <FormInput label={t('currency')} {...register('currency')} />
            <div>
              <label className="label">{t('languagePreference')}</label>
              <LanguageSwitcher />
            </div>
          </form>
        </SummaryCard>

        <SummaryCard title={t('taxSettings')}>
          <p className="text-sm text-gray-500 mb-4">{t('taxDisclaimer')}</p>
          <form className="space-y-4">
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
          </form>
        </SummaryCard>

        <SummaryCard title={t('approvalLimits')}>
          <FormInput label="Auto-approve below (Rs.)" type="number" {...register('approvalAutoLimit')} />
        </SummaryCard>

        <SummaryCard title={t('subscription')}>
          <p className="text-sm text-gray-600">Free trial · Small Office plan (up to 3 users)</p>
          <PremiumButton variant="secondary" className="mt-4">{t('comingSoon')}</PremiumButton>
        </SummaryCard>

        <SummaryCard title={t('dataExport')}>
          <PremiumButton variant="secondary">{t('exportPdf')} ({t('comingSoon')})</PremiumButton>
        </SummaryCard>

        <PremiumButton type="submit">{t('save')}</PremiumButton>
      </div>
    </AppShell>
  );
}
