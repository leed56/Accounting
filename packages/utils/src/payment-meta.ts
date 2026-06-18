import type { PaymentMethod } from '@bizmanager/types';

export type PaymentMetaInput = {
  paymentMethod: PaymentMethod;
  paymentReference?: string | null;
  chequeNumber?: string | null;
  chequeStatus?: 'pending' | 'cleared' | 'bounced' | 'cancelled' | null;
};

export function buildPaymentMetaFields(input: PaymentMetaInput) {
  const ref = input.paymentReference?.trim() || null;
  const chequeNumber = input.chequeNumber?.trim() || null;

  if (input.paymentMethod === 'cheque') {
    return {
      payment_reference: ref,
      cheque_number: chequeNumber,
      cheque_status: input.chequeStatus ?? 'pending',
      cheque_cleared_at: null as string | null,
    };
  }

  if (input.paymentMethod === 'lankaqr') {
    return {
      payment_reference: ref,
      cheque_number: null,
      cheque_status: null,
      cheque_cleared_at: null,
    };
  }

  return {
    payment_reference: ref,
    cheque_number: null,
    cheque_status: null,
    cheque_cleared_at: null,
  };
}

/** LankaQR reference format hint for Sri Lanka merchants */
export function formatLankaQrReferenceHint(amount: number, merchantId?: string) {
  const id = merchantId ?? 'MERCHANT';
  return `LKQR-${id}-${Math.round(amount)}`;
}

export function buildLankaQrDeepLink(reference: string) {
  const encoded = encodeURIComponent(reference.trim());
  return `https://www.lankaqr.lk/pay?ref=${encoded}`;
}
