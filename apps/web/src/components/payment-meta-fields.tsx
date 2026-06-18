'use client';

import { UseFormRegister, FieldErrors, UseFormWatch, FieldValues, Path } from 'react-hook-form';
import { FormInput } from '@/components/form-fields';
import { useTranslation } from '@/components/language-switcher';
import type { PaymentMethod } from '@bizmanager/types';
import { buildLankaQrDeepLink } from '@bizmanager/utils';

type PaymentMetaShape = {
  paymentMethod: PaymentMethod;
  paymentReference?: string | null;
  chequeNumber?: string | null;
};

interface PaymentMetaFieldsProps<T extends FieldValues & PaymentMetaShape> {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
}

export function PaymentMetaFields<T extends FieldValues & PaymentMetaShape>({
  register,
  watch,
  errors,
}: PaymentMetaFieldsProps<T>) {
  const { t } = useTranslation();
  const method = watch('paymentMethod' as Path<T>);
  const reference = watch('paymentReference' as Path<T>) as string | undefined;

  if (method === 'cheque') {
    return (
      <FormInput
        label={t('chequeNumber')}
        required
        error={errors.chequeNumber?.message as string | undefined}
        {...register('chequeNumber' as Path<T>)}
      />
    );
  }

  if (method === 'lankaqr') {
    return (
      <div className="space-y-2">
        <FormInput
          label={t('lankaQrReference')}
          required
          error={errors.paymentReference?.message as string | undefined}
          {...register('paymentReference' as Path<T>)}
        />
        {reference?.trim() ? (
          <a
            href={buildLankaQrDeepLink(reference)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {t('openLankaQr')}
          </a>
        ) : null}
      </div>
    );
  }

  return null;
}
