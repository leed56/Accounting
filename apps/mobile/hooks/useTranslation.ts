import { useMobileStore } from '@/stores/app-store';
import { t, languages, type Language } from '@bizmanager/i18n';

export function useTranslation() {
  const language = useMobileStore((s) => s.language);
  return {
    language,
    t: (key: Parameters<typeof t>[1], params?: Record<string, string | number>) =>
      t(language, key, params),
    languages,
    setLanguage: useMobileStore((s) => s.setLanguage),
  };
}
