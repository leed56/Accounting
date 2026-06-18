'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
  type LoginInput,
  type PhoneOtpRequestInput,
  type PhoneOtpVerifyInput,
} from '@bizmanager/types';
import { FormInput } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { LanguageSwitcher, useTranslation } from '@/components/language-switcher';
import {
  signIn,
  signInWithPhoneOtp,
  verifyPhoneOtp,
} from '@bizmanager/supabase-client';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/components/toast';
import Link from 'next/link';
import { TrendingUp, Users, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refresh } = useAuth();
  const toast = useToast((s) => s.show);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'appleview778@gmail.com', password: 'BizManager2026!' },
  });

  const phoneForm = useForm<PhoneOtpRequestInput>({
    resolver: zodResolver(phoneOtpRequestSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<PhoneOtpVerifyInput>({
    resolver: zodResolver(phoneOtpVerifySchema),
    defaultValues: { phone: '', token: '' },
  });

  const onEmailSubmit = emailForm.handleSubmit(async (data) => {
    setLoading(true);
    setError('');
    const { error: authError } = await signIn(data.email, data.password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    await refresh();
    toast(t('success'), 'success');
    router.push('/dashboard');
    setLoading(false);
  });

  const onSendOtp = phoneForm.handleSubmit(async (data) => {
    setLoading(true);
    setError('');
    const { error: authError } = await signInWithPhoneOtp(data.phone);
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    otpForm.setValue('phone', data.phone);
    setOtpSent(true);
  });

  const onVerifyOtp = otpForm.handleSubmit(async (data) => {
    setLoading(true);
    setError('');
    const { error: authError } = await verifyPhoneOtp(data.phone, data.token);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    await refresh();
    toast(t('success'), 'success');
    router.push('/dashboard');
    setLoading(false);
  });

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative">
          <h1 className="text-3xl font-bold">{t('appName')}</h1>
          <p className="text-white/80 mt-2 text-lg">{t('tagline')}</p>
        </div>
        <div className="relative space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/15 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold">{t('finance')}</p>
              <p className="text-sm text-white/70">{t('moneyToReceive')} & {t('moneyToPay')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/15 rounded-lg"><Users className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold">{t('staff')}</p>
              <p className="text-sm text-white/70">{t('attendance')}, {t('leave')}, {t('payroll')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/15 rounded-lg"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold">{t('aiAssistant')}</p>
              <p className="text-sm text-white/70">{t('dailyBriefing')}</p>
            </div>
          </div>
        </div>
        <p className="relative text-sm text-white/50">Built for Sri Lankan small businesses</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-primary">{t('appName')}</h1>
            </div>
            <LanguageSwitcher />
          </div>
          <div className="card shadow-elevated">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('login')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('signInToContinue')}</p>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className={`flex-1 py-2 text-sm rounded-lg ${mode === 'email' ? 'bg-primary-light text-primary-dark font-semibold' : 'bg-gray-100'}`}
                onClick={() => setMode('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm rounded-lg ${mode === 'phone' ? 'bg-primary-light text-primary-dark font-semibold' : 'bg-gray-100'}`}
                onClick={() => setMode('phone')}
              >
                {t('loginWithPhone')}
              </button>
            </div>

            {mode === 'email' ? (
              <form onSubmit={onEmailSubmit} className="space-y-4">
                <FormInput
                  label={t('email')}
                  type="email"
                  required
                  error={emailForm.formState.errors.email?.message}
                  {...emailForm.register('email')}
                />
                <FormInput
                  label={t('password')}
                  type="password"
                  required
                  error={emailForm.formState.errors.password?.message}
                  {...emailForm.register('password')}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <PremiumButton type="submit" className="w-full" loading={loading}>
                  {t('signIn')}
                </PremiumButton>
              </form>
            ) : !otpSent ? (
              <form onSubmit={onSendOtp} className="space-y-4">
                <FormInput
                  label={t('phoneNumber')}
                  placeholder="771234567"
                  required
                  error={phoneForm.formState.errors.phone?.message}
                  {...phoneForm.register('phone')}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <PremiumButton type="submit" className="w-full" loading={loading}>
                  {t('sendOtp')}
                </PremiumButton>
              </form>
            ) : (
              <form onSubmit={onVerifyOtp} className="space-y-4">
                <FormInput
                  label={t('otpCode')}
                  required
                  error={otpForm.formState.errors.token?.message}
                  {...otpForm.register('token')}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <PremiumButton type="submit" className="w-full" loading={loading}>
                  {t('verifyOtp')}
                </PremiumButton>
              </form>
            )}

            <Link
              href="/forgot-password"
              className="block mt-4 text-center text-sm text-primary font-medium"
            >
              {t('forgotPassword')}
            </Link>
            <Link
              href="/setup"
              className="block mt-3 text-center text-sm text-primary font-medium"
            >
              {t('companySetup')}
            </Link>
            <Link
              href="/privacy"
              className="block mt-3 text-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
