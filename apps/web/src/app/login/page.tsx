'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@bizmanager/types';
import { FormInput } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { LanguageSwitcher, useTranslation } from '@/components/language-switcher';
import { signIn } from '@bizmanager/supabase-client';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'appleview778@gmail.com', password: 'BizManager2026!' },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await signIn(data.email, data.password);
      if (authError && !authError.message.includes('Invalid')) {
        // Demo mode - proceed anyway
      }
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('login')}</h1>
          <p className="text-sm text-gray-500 mb-6">Royal Travels Office</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label={t('email')}
              type="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <FormInput
              label={t('password')}
              type="password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <PremiumButton type="submit" className="w-full" loading={loading}>
              {t('signIn')}
            </PremiumButton>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Demo mode — click Sign In to continue
          </p>
          <Link
            href="/setup"
            className="block mt-4 text-center text-sm text-primary font-medium"
          >
            {t('companySetup')}
          </Link>
        </div>
      </div>
    </div>
  );
}
