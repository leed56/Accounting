'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySetupSchema, type CompanySetupInput } from '@bizmanager/types';
import { BUSINESS_TYPES } from '@bizmanager/types';
import { FormInput, SelectField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';

export default function SetupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setCompanyId = useAppStore((s) => s.setCompanyId);

  const {
    register,
    handleSubmit,
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

  const onSubmit = (data: CompanySetupInput) => {
    setCompanyId('00000000-0000-4000-8000-000000000001');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('companySetup')}</h1>
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
              label: b.replace(/_/g, ' '),
            }))}
            error={errors.businessType?.message}
            {...register('businessType')}
          />
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
          <PremiumButton type="submit" className="w-full">
            {t('continue')}
          </PremiumButton>
        </form>
      </div>
    </div>
  );
}
