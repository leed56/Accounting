import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  trend,
  variant = 'default',
  icon,
  className,
}: {
  label: string;
  value: string;
  trend?: string;
  variant?: 'default' | 'income' | 'expense' | 'profit' | 'warning' | 'ai';
  icon?: ReactNode;
  className?: string;
}) {
  const variants = {
    default: 'border-gray-100',
    income: 'border-l-4 border-l-income',
    expense: 'border-l-4 border-l-expense',
    profit: 'border-l-4 border-l-profit',
    warning: 'border-l-4 border-l-warning',
    ai: 'border-l-4 border-l-ai',
  };

  return (
    <div className={cn('card', variants[variant], className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="metric-value mt-2 text-gray-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
    </div>
  );
}

export function SummaryCard({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('card', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
