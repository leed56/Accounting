'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-danger text-white hover:bg-red-600 min-h-[44px] px-4 py-2.5 rounded-md font-semibold text-sm',
    ghost: 'text-gray-600 hover:bg-gray-100 min-h-[44px] px-4 py-2.5 rounded-md font-medium text-sm',
  };
  const sizes = {
    sm: 'text-xs px-3 py-2 min-h-[36px]',
    md: '',
    lg: 'text-base px-6 py-3 min-h-[52px]',
  };

  return (
    <button
      className={cn(variants[variant], sizes[size], className, loading && 'opacity-70')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'primary',
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger';
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-elevated max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <PremiumButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </PremiumButton>
          <PremiumButton variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
