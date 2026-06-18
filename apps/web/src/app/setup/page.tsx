'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySetupSchema, type CompanySetupInput, type BusinessType, BUSINESS_TYPES } from '@bizmanager/types';
import { FormInput, SelectField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAuth } from '@/components/auth-provider';
import { useAppStore } from '@/stores/app-store';
import {
  createCompanyWithProfile,
  getSession,
  SAMPLE_COMPANY_ID,
} from '@bizmanager/supabase-client';
import { getCategoryName, getExpenseCategoriesForBusinessType } from '@bizmanager/utils';

const BUSINESS_TYPE_LABEL_KEYS: Record<BusinessType, 'bizType_travel_agency' | 'bizType_retail_shop' | 'bizType_service_business' | 'bizType_office_admin' | 'bizType_restaurant_cafe' | 'bizType_freelancer_agency' | 'bizType_other'> = {
  travel_agency: 'bizType_travel_agency',
  retail_shop: 'bizType_retail_shop',
  service_business: 'bizType_service_business',
  office_admin: 'bizType_office_admin',
  restaurant_cafe: 'bizType_restaurant_cafe',
  freelancer_agency: 'bizType_freelancer_agency',
  other: 'bizType_other',
};

export default function SetupPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const { refresh } = useAuth();
  const setCompanyId = useAppStore((s) => s.setCompanyId);
  const [loading, setLoading] = useState(false);

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
      if (session?.user?.email) {
        const result = await createCompanyWithProfile(session.user.id, session.user.email, {
          businessName: data.businessName,
          businessType: data.businessType,
          currency: data.currency,
          ownerName: data.ownerName,
          staffModuleEnabled: data.staffModuleEnabled,
          taxEnabled: data.taxEnabled,
          language: data.language,
        });
        if (!result) throw new Error('Could not create company');
        setCompanyId(result.companyId);
        await refresh();
      } else {
        setCompanyId(SAMPLE_COMPANY_ID);
      }
      toast(t('success'), 'success');
      router.push('/dashboard');
    } catch (e) {
      toast(e instanceof Error ? e.message : t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full card">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('companySetup')}</h1>
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
            options={BUSINESS_TYPES.map((b) => ({
              value: b,
              label: t(BUSINESS_TYPE_LABEL_KEYS[b]),
            }))}
            error={errors.businessType?.message}
            {...register('businessType')}
          />

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
