'use client';

import { cn } from '@/lib/utils';
import type { PeriodType } from '@bizmanager/types';
import { useTranslation } from './language-switcher';

const periods: PeriodType[] = ['daily', 'weekly', 'monthly'];

export function PeriodToggle({
  value,
  onChange,
}: {
  value: PeriodType;
  onChange: (p: PeriodType) => void;
}) {
  const { t } = useTranslation();

  const labels: Record<PeriodType, string> = {
    daily: t('daily'),
    weekly: t('weekly'),
    monthly: t('monthly'),
  };

  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors min-h-[36px]',
            value === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {labels[p]}
        </button>
      ))}
    </div>
  );
}

export function DateRangeSwitcher({
  value,
  onChange,
}: {
  value: PeriodType;
  onChange: (p: PeriodType) => void;
}) {
  return <PeriodToggle value={value} onChange={onChange} />;
}
