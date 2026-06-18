'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@bizmanager/types';
import { FormInput } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { LanguageSwitcher, useTranslation } from '@/components/language-switcher';
import { resetPasswordForEmail } from '@bizmanager/supabase-client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setError('');
    const { error: authError } = await resetPasswordForEmail(data.email);
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="card shadow-elevated">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('forgotPassword')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('forgotPasswordDesc')}</p>
          {sent ? (
            <p className="text-sm text-primary">{t('resetEmailSent')}</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <FormInput
                label={t('email')}
                type="email"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <PremiumButton type="submit" className="w-full" loading={loading}>
                {t('sendResetLink')}
              </PremiumButton>
            </form>
          )}
          <Link href="/login" className="block mt-4 text-center text-sm text-primary font-medium">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
