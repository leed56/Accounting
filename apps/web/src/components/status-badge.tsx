import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-warning-light text-amber-800',
  approved: 'bg-green-50 text-green-800',
  rejected: 'bg-red-50 text-red-800',
  paid: 'bg-blue-50 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-600',
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-warning-light text-amber-800',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        statusStyles[status] ?? statusStyles.pending
      )}
    >
      {status}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-red-50 text-red-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        styles[level] ?? styles.low
      )}
    >
      {level} risk
    </span>
  );
}
