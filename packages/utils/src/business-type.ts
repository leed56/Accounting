import type { BusinessType } from '@bizmanager/types';

/**
 * Setup order: most common Sri Lankan micro businesses first (customer research, not gov codes).
 */
export const BUSINESS_TYPE_SETUP_ORDER: BusinessType[] = [
  'grocery_kade',
  'retail_shop',
  'textile_shop',
  'multi_vendor',
  'restaurant_cafe',
  'salon_beauty',
  'pharmacy',
  'tuition_education',
  'transport_hire',
  'construction_contractor',
  'workshop_repair',
  'guesthouse',
  'agriculture',
  'travel_agency',
  'office_admin',
  'freelancer_agency',
  'service_business',
  'other',
];

export const BUSINESS_TYPE_LABEL_KEYS = {
  grocery_kade: 'bizType_grocery_kade',
  textile_shop: 'bizType_textile_shop',
  multi_vendor: 'bizType_multi_vendor',
  guesthouse: 'bizType_guesthouse',
  pharmacy: 'bizType_pharmacy',
  agriculture: 'bizType_agriculture',
  travel_agency: 'bizType_travel_agency',
  retail_shop: 'bizType_retail_shop',
  service_business: 'bizType_service_business',
  office_admin: 'bizType_office_admin',
  restaurant_cafe: 'bizType_restaurant_cafe',
  freelancer_agency: 'bizType_freelancer_agency',
  construction_contractor: 'bizType_construction_contractor',
  salon_beauty: 'bizType_salon_beauty',
  tuition_education: 'bizType_tuition_education',
  transport_hire: 'bizType_transport_hire',
  workshop_repair: 'bizType_workshop_repair',
  other: 'bizType_other',
} as const satisfies Record<BusinessType, string>;

export const BUSINESS_TYPE_DESC_KEYS = {
  grocery_kade: 'bizTypeDesc_grocery_kade',
  textile_shop: 'bizTypeDesc_textile_shop',
  multi_vendor: 'bizTypeDesc_multi_vendor',
  guesthouse: 'bizTypeDesc_guesthouse',
  pharmacy: 'bizTypeDesc_pharmacy',
  agriculture: 'bizTypeDesc_agriculture',
  travel_agency: 'bizTypeDesc_travel_agency',
  retail_shop: 'bizTypeDesc_retail_shop',
  service_business: 'bizTypeDesc_service_business',
  office_admin: 'bizTypeDesc_office_admin',
  restaurant_cafe: 'bizTypeDesc_restaurant_cafe',
  freelancer_agency: 'bizTypeDesc_freelancer_agency',
  construction_contractor: 'bizTypeDesc_construction_contractor',
  salon_beauty: 'bizTypeDesc_salon_beauty',
  tuition_education: 'bizTypeDesc_tuition_education',
  transport_hire: 'bizTypeDesc_transport_hire',
  workshop_repair: 'bizTypeDesc_workshop_repair',
  other: 'bizTypeDesc_other',
} as const satisfies Record<BusinessType, string>;
