import type { Language } from '@bizmanager/i18n';

export function getCategoryName(
  category: { name_en: string; name_si?: string | null; name_ta?: string | null },
  lang: Language
): string {
  if (lang === 'si' && category.name_si) return category.name_si;
  if (lang === 'ta' && category.name_ta) return category.name_ta;
  return category.name_en;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name_en: 'Rent', name_si: 'කුලී', name_ta: 'கட்டணம்', icon: 'home', color: '#3B82F6' },
  { name_en: 'Fuel', name_si: 'ඉන්ධන', name_ta: 'எரிபொருள்', icon: 'fuel', color: '#F59E0B' },
  { name_en: 'Electricity', name_si: 'විදුලි', name_ta: 'மின்சாரம்', icon: 'zap', color: '#8B5CF6' },
  { name_en: 'Internet', name_si: 'අන්තර්ජාල', name_ta: 'இணையம்', icon: 'wifi', color: '#06B6D4' },
  { name_en: 'Stationery', name_si: 'ලිපිද්‍රව්‍ය', name_ta: 'ஸ்டேஷனரி', icon: 'file', color: '#64748B' },
  { name_en: 'Maintenance', name_si: 'නඩත්තු', name_ta: 'பராமரிப்பு', icon: 'wrench', color: '#EC4899' },
  { name_en: 'Salaries', name_si: 'වැටුප්', name_ta: 'சம்பளம்', icon: 'users', color: '#16A34A' },
  { name_en: 'Other', name_si: 'වෙනත්', name_ta: 'மற்றவை', icon: 'more', color: '#9CA3AF' },
];
