import type { Language } from '@bizmanager/i18n';
import type { BusinessType } from '@bizmanager/types';

export type CategoryTemplate = {
  name_en: string;
  name_si: string;
  name_ta: string;
  icon: string;
  color: string;
};

export function getCategoryName(
  category: { name_en: string; name_si?: string | null; name_ta?: string | null },
  lang: Language
): string {
  if (lang === 'si' && category.name_si) return category.name_si;
  if (lang === 'ta' && category.name_ta) return category.name_ta;
  return category.name_en;
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Rent', name_si: 'කුලී', name_ta: 'கட்டணம்', icon: 'home', color: '#3B82F6' },
  { name_en: 'Fuel', name_si: 'ඉන්ධන', name_ta: 'எரிபொருள்', icon: 'fuel', color: '#F59E0B' },
  { name_en: 'Electricity', name_si: 'විදුලි', name_ta: 'மின்சாரம்', icon: 'zap', color: '#8B5CF6' },
  { name_en: 'Internet', name_si: 'අන්තර්ජාල', name_ta: 'இணையம்', icon: 'wifi', color: '#06B6D4' },
  { name_en: 'Stationery', name_si: 'ලිපිද්‍රව්‍ය', name_ta: 'ஸ்டேஷனரி', icon: 'file', color: '#64748B' },
  { name_en: 'Maintenance', name_si: 'නඩත්තු', name_ta: 'பராமரிப்பு', icon: 'wrench', color: '#EC4899' },
  { name_en: 'Salaries', name_si: 'වැටුප්', name_ta: 'சம்பளம்', icon: 'users', color: '#16A34A' },
  { name_en: 'Other', name_si: 'වෙනත්', name_ta: 'மற்றவை', icon: 'more', color: '#9CA3AF' },
];

export const TRAVEL_AGENCY_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Vehicle Maintenance', name_si: 'වාහන නඩත්තු', name_ta: 'வாகன பராமரிப்பு', icon: 'wrench', color: '#EC4899' },
  { name_en: 'Marketing', name_si: 'ප්‍රචාරණ', name_ta: 'விளம்பரம்', icon: 'megaphone', color: '#F97316' },
  { name_en: 'Parking & Tolls', name_si: 'පාර්කිං', name_ta: 'பார்க்கிங்', icon: 'car', color: '#6366F1' },
];

export const RETAIL_SHOP_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Inventory', name_si: 'ඉන්වෙන්ටරි', name_ta: 'சரக்கு', icon: 'package', color: '#0EA5E9' },
  { name_en: 'Packaging', name_si: 'ඇසුරුම්', name_ta: 'பேக்கேஜிங்', icon: 'box', color: '#A855F7' },
  { name_en: 'Delivery', name_si: 'බෙදාහැරීම', name_ta: 'விநியோகம்', icon: 'truck', color: '#14B8A6' },
  { name_en: 'Shop Supplies', name_si: 'සාප්පු සැපයුම්', name_ta: 'கடை பொருட்கள்', icon: 'shopping-bag', color: '#EAB308' },
];

export const RESTAURANT_CAFE_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Food Ingredients', name_si: 'ආහාර අමුද්‍රව්‍ය', name_ta: 'உணவு பொருட்கள்', icon: 'utensils', color: '#EF4444' },
  { name_en: 'Kitchen Supplies', name_si: 'මුළුතැන්ගෙයි සැපයුම්', name_ta: 'சமையலறை பொருட்கள்', icon: 'chef-hat', color: '#F97316' },
  { name_en: 'Gas (LPG)', name_si: 'ගෑස්', name_ta: 'எல்பிஜி', icon: 'flame', color: '#DC2626' },
  { name_en: 'Cleaning', name_si: 'පිරිසිදු කිරීම', name_ta: 'சுத்தம்', icon: 'sparkles', color: '#06B6D4' },
];

export const OFFICE_ADMIN_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Software', name_si: 'මෘදුකාංග', name_ta: 'மென்பொருள்', icon: 'laptop', color: '#6366F1' },
  { name_en: 'Professional Services', name_si: 'වෘත්තීය සේවා', name_ta: 'தொழில்முறை சேவைகள்', icon: 'briefcase', color: '#8B5CF6' },
  { name_en: 'Travel', name_si: 'ගමන්', name_ta: 'பயணம்', icon: 'plane', color: '#0EA5E9' },
];

export const SERVICE_BUSINESS_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Tools & Equipment', name_si: 'මෙවලම්', name_ta: 'கருவிகள்', icon: 'hammer', color: '#78716C' },
  { name_en: 'Transport', name_si: 'ප්‍රවාහන', name_ta: 'போக்குவரத்து', icon: 'bus', color: '#0891B2' },
  { name_en: 'Client Entertainment', name_si: 'සේවා ලබන්නන්', name_ta: 'வாடிக்கையாளர்', icon: 'coffee', color: '#D97706' },
];

export const FREELANCER_AGENCY_EXPENSE_CATEGORIES: CategoryTemplate[] = [
  { name_en: 'Software', name_si: 'මෘදුකාංග', name_ta: 'மென்பொருள்', icon: 'laptop', color: '#6366F1' },
  { name_en: 'Subcontractors', name_si: 'උප කොන්ත්‍රාත්කරු', name_ta: 'துணை ஒப்பந்தக்காரர்கள்', icon: 'users', color: '#7C3AED' },
  { name_en: 'Marketing', name_si: 'ප්‍රචාරණ', name_ta: 'விளம்பரம்', icon: 'megaphone', color: '#F97316' },
];

const BUSINESS_TYPE_CATEGORY_EXTRAS: Record<BusinessType, CategoryTemplate[]> = {
  travel_agency: TRAVEL_AGENCY_EXPENSE_CATEGORIES,
  retail_shop: RETAIL_SHOP_EXPENSE_CATEGORIES,
  restaurant_cafe: RESTAURANT_CAFE_EXPENSE_CATEGORIES,
  office_admin: OFFICE_ADMIN_EXPENSE_CATEGORIES,
  service_business: SERVICE_BUSINESS_EXPENSE_CATEGORIES,
  freelancer_agency: FREELANCER_AGENCY_EXPENSE_CATEGORIES,
  other: [],
};

function mergeWithDefaults(extras: CategoryTemplate[]): CategoryTemplate[] {
  const seen = new Set(DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name_en));
  const uniqueExtras = extras.filter((c) => !seen.has(c.name_en));
  return [...DEFAULT_EXPENSE_CATEGORIES, ...uniqueExtras];
}

export function getExpenseCategoriesForBusinessType(businessType: BusinessType): CategoryTemplate[] {
  return mergeWithDefaults(BUSINESS_TYPE_CATEGORY_EXTRAS[businessType] ?? []);
}

export function getExtraCategoriesForBusinessType(businessType: BusinessType): CategoryTemplate[] {
  return BUSINESS_TYPE_CATEGORY_EXTRAS[businessType] ?? [];
}
