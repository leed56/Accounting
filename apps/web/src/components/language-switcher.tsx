'use client';

import { useAppStore } from '@/stores/app-store';
import { t, languages, type Language } from '@bizmanager/i18n';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useAppStore();

  return (
    <div className={cn('flex items-center gap-1', compact ? 'text-xs' : 'text-sm')}>
      {!compact && <Globe className="h-4 w-4 text-gray-500" />}
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code as Language)}
          className={cn(
            'px-2 py-1 rounded-md font-medium transition-colors min-h-[32px]',
            language === lang.code
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          aria-label={lang.label}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  return {
    language,
    t: (key: Parameters<typeof t>[1], params?: Record<string, string | number>) =>
      t(language, key, params),
  };
}
