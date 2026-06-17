export type Language = 'en' | 'si' | 'ta';

export const languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
];

export type TranslationKeys = typeof import('./locales/en').default;

export { default as en } from './locales/en';
export { default as si } from './locales/si';
export { default as ta } from './locales/ta';

import en from './locales/en';
import si from './locales/si';
import ta from './locales/ta';

export const translations = { en, si, ta } as const;

export function t(
  lang: Language,
  key: keyof typeof en,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] ?? translations.en;
  let text: string = String(dict[key] ?? en[key] ?? key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, String(v));
    });
  }
  return text;
}

export function getNestedTranslation(
  lang: Language,
  path: string
): string {
  const dict = translations[lang] ?? translations.en;
  const keys = path.split('.');
  let current: unknown = dict;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}
