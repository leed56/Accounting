import { cn } from '@/lib/utils';
import { formatCurrency } from '@bizmanager/utils';
import type { PaymentRequest } from '@bizmanager/types';
import Link from 'next/link';
import { StatusBadge } from './status-badge';
import { RiskBadge } from './risk-badge';

export function ApprovalCard({ request }: { request: PaymentRequest }) {
  return (
    <Link
      href={`/approvals/${request.id}`}
      className="card block hover:shadow-elevated transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">
            {request.payee_name ?? request.category ?? request.request_type}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{request.description}</p>
        </div>
        <p className="text-lg font-bold text-gray-900 shrink-0">
          {formatCurrency(request.amount)}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <StatusBadge status={request.status} />
        <RiskBadge level={request.risk_level} />
        <span className="text-xs text-gray-400 capitalize">{request.request_type}</span>
      </div>
      {request.ai_note && (
        <p className="mt-3 text-xs text-ai bg-ai-light rounded-md px-3 py-2">
          {request.ai_note}
        </p>
      )}
    </Link>
  );
}
