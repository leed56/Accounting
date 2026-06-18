import type { BusinessType } from '@bizmanager/types';

export const MULTI_VENDOR_COMMISSION_CATEGORIES = [
  'Vendor Commission',
  'Service Fee',
  'Listing Fee',
] as const;

export const MULTI_VENDOR_SETTLEMENT_CATEGORY = 'Vendor Settlements';

export type BusinessTypeUiConfig = {
  usesVendorTerminology: boolean;
  supplierNavKey: 'suppliers' | 'vendors';
  addSupplierKey: 'addSupplier' | 'addVendor';
  payablesLabelKey: 'moneyToPay' | 'moneyToPayVendors';
  showCommissionMetrics: boolean;
  defaultCommissionCategory: string;
  defaultSettlementCategory: string;
};

const DEFAULT_CONFIG: BusinessTypeUiConfig = {
  usesVendorTerminology: false,
  supplierNavKey: 'suppliers',
  addSupplierKey: 'addSupplier',
  payablesLabelKey: 'moneyToPay',
  showCommissionMetrics: false,
  defaultCommissionCategory: 'General Income',
  defaultSettlementCategory: 'Other',
};

const MULTI_VENDOR_CONFIG: BusinessTypeUiConfig = {
  usesVendorTerminology: true,
  supplierNavKey: 'vendors',
  addSupplierKey: 'addVendor',
  payablesLabelKey: 'moneyToPayVendors',
  showCommissionMetrics: true,
  defaultCommissionCategory: 'Vendor Commission',
  defaultSettlementCategory: MULTI_VENDOR_SETTLEMENT_CATEGORY,
};

export function getBusinessTypeUiConfig(businessType: BusinessType | string | undefined): BusinessTypeUiConfig {
  if (businessType === 'multi_vendor') return MULTI_VENDOR_CONFIG;
  return DEFAULT_CONFIG;
}

export function isMultiVendorBusiness(businessType: BusinessType | string | undefined): boolean {
  return businessType === 'multi_vendor';
}
