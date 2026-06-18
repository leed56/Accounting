'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@bizmanager/types';
import { FormInput } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { updatePassword } from '@bizmanager/supabase-client';

export function ChangePasswordForm() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const { error } = await updatePassword(data.newPassword);
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    toast(t('passwordUpdated'), 'success');
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        label={t('newPassword')}
        type="password"
        required
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <FormInput
        label={t('confirmPassword')}
        type="password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <PremiumButton type="submit" loading={loading} variant="secondary">
        {t('updatePassword')}
      </PremiumButton>
    </form>
  );
}
