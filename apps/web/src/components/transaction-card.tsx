import { cn } from '@/lib/utils';
import { formatCurrency } from '@bizmanager/utils';
import { formatDate } from '@bizmanager/utils';
import type { Transaction } from '@bizmanager/types';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export function TransactionCard({
  transaction,
  categoryLabel,
}: {
  transaction: Transaction;
  categoryLabel?: string | null;
}) {
  const isIncome = transaction.type === 'income';
  const title =
    transaction.description ??
    categoryLabel ??
    transaction.category ??
    transaction.type;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isIncome ? 'bg-green-50 text-income' : 'bg-red-50 text-expense'
        )}
      >
        {isIncome ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500">
          {formatDate(transaction.transaction_date)} · {transaction.payment_method}
          {categoryLabel && transaction.description ? ` · ${categoryLabel}` : ''}
        </p>
      </div>
      <p
        className={cn(
          'font-semibold shrink-0',
          isIncome ? 'text-income' : 'text-expense'
        )}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </p>
    </div>
  );
}
