'use client';

import { useQuery } from '@tanstack/react-query';
import type { TranslationKeys } from '@bizmanager/i18n';
import { getBusinessTypeUiConfig } from '@bizmanager/utils';
import { getCompany, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/components/language-switcher';

export function useBusinessLabels() {
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const { t } = useTranslation();

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const config = getBusinessTypeUiConfig(company?.business_type);

  const label = (key: keyof TranslationKeys) => t(key);

  return {
    company,
    config,
    isMultiVendor: config.showCommissionMetrics,
    suppliersTitle: label(config.supplierNavKey),
    addSupplierTitle: label(config.addSupplierKey),
    payablesLabel: label(config.payablesLabelKey),
    vendorLabel: label('vendor'),
  };
}
