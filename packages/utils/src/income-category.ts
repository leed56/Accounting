import type { BusinessType } from '@bizmanager/types';
import type { CategoryTemplate } from './category';

export const DEFAULT_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'General Income', name_si: 'සාමාන්‍ය ආදායම', name_ta: 'பொது வருமானம்', icon: 'coins', color: '#16A34A' },
  { name_en: 'Customer Payment', name_si: 'පාරිභෝගික ගෙවීම', name_ta: 'வாடிக்கையாளர் கட்டணம்', icon: 'users', color: '#0EA5E9' },
  { name_en: 'Cash Sales', name_si: 'මුදල් විකිණීම', name_ta: 'பண விற்பனை', icon: 'banknote', color: '#22C55E' },
  { name_en: 'Other', name_si: 'වෙනත්', name_ta: 'மற்றவை', icon: 'more', color: '#9CA3AF' },
];

export const TRAVEL_AGENCY_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Tour Booking', name_si: 'Tour Booking', name_ta: 'Tour Booking', icon: 'map', color: '#3B82F6' },
  { name_en: 'Airport Transfer', name_si: 'Airport Transfer', name_ta: 'Airport Transfer', icon: 'plane', color: '#6366F1' },
  { name_en: 'Vehicle Hire', name_si: 'Vehicle Hire', name_ta: 'Vehicle Hire', icon: 'car', color: '#0891B2' },
  { name_en: 'Commission', name_si: 'Commission', name_ta: 'Commission', icon: 'percent', color: '#F97316' },
];

export const RETAIL_SHOP_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Product Sales', name_si: 'Product Sales', name_ta: 'Product Sales', icon: 'shopping-bag', color: '#0EA5E9' },
  { name_en: 'Wholesale Order', name_si: 'Wholesale Order', name_ta: 'Wholesale Order', icon: 'package', color: '#8B5CF6' },
  { name_en: 'Delivery Charge', name_si: 'Delivery Charge', name_ta: 'Delivery Charge', icon: 'truck', color: '#14B8A6' },
];

export const RESTAURANT_CAFE_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Dine-in Sales', name_si: 'Dine-in Sales', name_ta: 'Dine-in Sales', icon: 'utensils', color: '#EF4444' },
  { name_en: 'Takeaway', name_si: 'Takeaway', name_ta: 'Takeaway', icon: 'bag', color: '#F97316' },
  { name_en: 'Catering', name_si: 'Catering', name_ta: 'Catering', icon: 'chef-hat', color: '#DC2626' },
];

export const SALON_BEAUTY_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Service Fee', name_si: 'Service Fee', name_ta: 'Service Fee', icon: 'scissors', color: '#EC4899' },
  { name_en: 'Product Sale', name_si: 'Product Sale', name_ta: 'Product Sale', icon: 'sparkles', color: '#A855F7' },
];

export const TUITION_EDUCATION_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Tuition Fee', name_si: 'Tuition Fee', name_ta: 'Tuition Fee', icon: 'book', color: '#3B82F6' },
  { name_en: 'Registration Fee', name_si: 'Registration Fee', name_ta: 'Registration Fee', icon: 'file', color: '#6366F1' },
  { name_en: 'Exam Class', name_si: 'Exam Class', name_ta: 'Exam Class', icon: 'calendar', color: '#8B5CF6' },
];

export const TRANSPORT_HIRE_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Hire Trip', name_si: 'Hire Trip', name_ta: 'Hire Trip', icon: 'car', color: '#0891B2' },
  { name_en: 'Daily Hire', name_si: 'Daily Hire', name_ta: 'Daily Hire', icon: 'clock', color: '#0EA5E9' },
  { name_en: 'Airport Run', name_si: 'Airport Run', name_ta: 'Airport Run', icon: 'plane', color: '#6366F1' },
];

export const CONSTRUCTION_CONTRACTOR_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Contract Payment', name_si: 'Contract Payment', name_ta: 'Contract Payment', icon: 'file', color: '#78716C' },
  { name_en: 'Advance Payment', name_si: 'Advance Payment', name_ta: 'Advance Payment', icon: 'banknote', color: '#16A34A' },
  { name_en: 'Final Payment', name_si: 'Final Payment', name_ta: 'Final Payment', icon: 'check', color: '#22C55E' },
];

export const WORKSHOP_REPAIR_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Repair Job', name_si: 'Repair Job', name_ta: 'Repair Job', icon: 'wrench', color: '#78716C' },
  { name_en: 'Parts Sale', name_si: 'Parts Sale', name_ta: 'Parts Sale', icon: 'cog', color: '#64748B' },
];

export const SERVICE_INCOME_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Client Payment', name_si: 'Client Payment', name_ta: 'Client Payment', icon: 'briefcase', color: '#6366F1' },
  { name_en: 'Project Fee', name_si: 'Project Fee', name_ta: 'Project Fee', icon: 'folder', color: '#8B5CF6' },
  { name_en: 'Retainer', name_si: 'Retainer', name_ta: 'Retainer', icon: 'repeat', color: '#0EA5E9' },
];

const BUSINESS_TYPE_INCOME_EXTRAS: Record<BusinessType, CategoryTemplate[]> = {
  travel_agency: TRAVEL_AGENCY_INCOME_CATEGORIES,
  retail_shop: RETAIL_SHOP_INCOME_CATEGORIES,
  restaurant_cafe: RESTAURANT_CAFE_INCOME_CATEGORIES,
  salon_beauty: SALON_BEAUTY_INCOME_CATEGORIES,
  tuition_education: TUITION_EDUCATION_INCOME_CATEGORIES,
  transport_hire: TRANSPORT_HIRE_INCOME_CATEGORIES,
  construction_contractor: CONSTRUCTION_CONTRACTOR_INCOME_CATEGORIES,
  workshop_repair: WORKSHOP_REPAIR_INCOME_CATEGORIES,
  office_admin: SERVICE_INCOME_CATEGORIES,
  freelancer_agency: SERVICE_INCOME_CATEGORIES,
  service_business: SERVICE_INCOME_CATEGORIES,
  other: [],
};

function mergeWithDefaults(extras: CategoryTemplate[]): CategoryTemplate[] {
  const seen = new Set(DEFAULT_INCOME_CATEGORIES.map((c) => c.name_en));
  const uniqueExtras = extras.filter((c) => !seen.has(c.name_en));
  return [...DEFAULT_INCOME_CATEGORIES, ...uniqueExtras];
}

export function getIncomeCategoriesForBusinessType(businessType: BusinessType): CategoryTemplate[] {
  return mergeWithDefaults(BUSINESS_TYPE_INCOME_EXTRAS[businessType] ?? []);
}
