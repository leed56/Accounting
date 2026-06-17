'use client';

import { LanguageSwitcher, useTranslation } from '@/components/language-switcher';
import { PremiumButton } from '@/components/premium-button';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-bold mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
          <p className="mt-2 text-gray-600">{t('tagline')}</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('selectLanguage')}
          </h2>
          <LanguageSwitcher />
          <PremiumButton
            className="w-full mt-6"
            onClick={() => router.push('/login')}
          >
            {t('continue')}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
