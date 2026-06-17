import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: JSX.Element;
  title: string;
  description?: string;
  action?: JSX.Element;
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon != null && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action != null && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card animate-pulse', className)}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  );
}
