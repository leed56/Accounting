import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export function InsightCard({
  title,
  message,
  severity = 'info',
  className,
}: {
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
  className?: string;
}) {
  const styles = {
    info: 'bg-ai-light border-ai/20',
    warning: 'bg-warning-light border-warning/20',
    critical: 'bg-danger-light border-danger/20',
  };

  return (
    <div className={cn('card border', styles[severity], className)}>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ai/10 text-ai">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
