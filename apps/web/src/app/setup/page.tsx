'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySetupSchema, type CompanySetupInput, type BusinessType } from '@bizmanager/types';
import { FormInput, SelectField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAuth } from '@/components/auth-provider';
import { useAppStore } from '@/stores/app-store';
import { getSession, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import {
  getCategoryName,
  getExpenseCategoriesForBusinessType,
  BUSINESS_TYPE_SETUP_ORDER,
  BUSINESS_TYPE_LABEL_KEYS,
  BUSINESS_TYPE_DESC_KEYS,
} from '@bizmanager/utils';
import type { TranslationKeys } from '@bizmanager/i18n';

export default function SetupPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const { profile, loading: authLoading, refresh } = useAuth();
  const setCompanyId = useAppStore((s) => s.setCompanyId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && profile) {
      setCompanyId(profile.company_id);
      router.replace('/dashboard');
    }
  }, [authLoading, profile, router, setCompanyId]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompanySetupInput>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      businessName: 'Royal Travels Office',
      businessType: 'travel_agency',
      currency: 'LKR',
      ownerName: 'Kasun Perera',
      numberOfStaff: 4,
      staffModuleEnabled: true,
      taxEnabled: false,
      language: 'en',
    },
  });

  const businessType = watch('businessType') as BusinessType;
  const previewCategories = getExpenseCategoriesForBusinessType(businessType);

  const onSubmit = async (data: CompanySetupInput) => {
    setLoading(true);
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        setCompanyId(SAMPLE_COMPANY_ID);
        toast(t('success'), 'success');
        router.push('/dashboard');
        return;
      }

      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.status === 409 && json.companyId) {
        setCompanyId(json.companyId);
        await refresh();
        toast(json.error ?? t('alreadyHasCompany'), 'success');
        router.push('/dashboard');
        return;
      }

      if (!res.ok) {
        throw new Error(json.error ?? 'Could not create company');
      }

      setCompanyId(json.companyId);
      await refresh();
      toast(t('success'), 'success');
      router.push('/dashboard');
    } catch (e) {
      toast(e instanceof Error ? e.message : t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const label = (type: BusinessType) =>
    t(BUSINESS_TYPE_LABEL_KEYS[type] as keyof TranslationKeys);
  const desc = (type: BusinessType) =>
    t(BUSINESS_TYPE_DESC_KEYS[type] as keyof TranslationKeys);

  if (authLoading || profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full card">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('companySetup')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('companySetupHint')}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label={t('businessName')}
            required
            error={errors.businessName?.message}
            {...register('businessName')}
          />
          <SelectField
            label={t('businessType')}
            required
            options={BUSINESS_TYPE_SETUP_ORDER.map((b) => ({
              value: b,
              label: label(b),
            }))}
            error={errors.businessType?.message}
            {...register('businessType')}
          />

          <p className="text-sm text-gray-600 dark:text-gray-300">{desc(businessType)}</p>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('categoryTemplatePreview')}
            </p>
            <div className="flex flex-wrap gap-2">
              {previewCategories.map((cat) => (
                <span
                  key={cat.name_en}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {getCategoryName(cat, language)}
                </span>
              ))}
            </div>
          </div>

          <FormInput
            label={t('ownerName')}
            required
            error={errors.ownerName?.message}
            {...register('ownerName')}
          />
          <FormInput
            label={t('currency')}
            {...register('currency')}
          />
          <FormInput
            label={t('numberOfStaff')}
            type="number"
            {...register('numberOfStaff')}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('staffModuleEnabled')} className="rounded" />
            {t('enableStaffModule')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('taxEnabled')} className="rounded" />
            {t('enableTax')}
          </label>
          <PremiumButton type="submit" className="w-full" loading={loading}>
            {t('continue')}
          </PremiumButton>
        </form>
      </div>
    </div>
  );
}
