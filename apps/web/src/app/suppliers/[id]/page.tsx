'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { SummaryCard } from '@/components/metric-card';
import { TransactionCard } from '@/components/transaction-card';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { useBusinessLabels } from '@/hooks/use-business-labels';
import {
  getSupplier,
  getExpenseCategories,
  getIncomeCategories,
  getSupplierTransactions,
  queryKeys,
} from '@bizmanager/supabase-client';
import { formatCurrency, resolveTransactionCategoryLabel } from '@bizmanager/utils';
import { Pencil, ArrowLeft, Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SupplierDetailPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const id = params.id as string;
  const companyId = useAppStore((s) => s.companyId)!;
  const { vendorLabel, isMultiVendor } = useBusinessLabels();

  const { data: supplier, isLoading } = useQuery({
    queryKey: queryKeys.supplier(id),
    queryFn: () => getSupplier(id),
    enabled: !!id,
  });

  const { data: transactions } = useQuery({
    queryKey: queryKeys.supplierTransactions(id),
    queryFn: () => getSupplierTransactions(id),
    enabled: !!id,
  });

  const { data: expenseCategories } = useQuery({
    queryKey: queryKeys.categories(companyId),
    queryFn: () => getExpenseCategories(companyId),
  });

  const { data: incomeCategories } = useQuery({
    queryKey: queryKeys.incomeCategories(companyId),
    queryFn: () => getIncomeCategories(companyId),
  });

  if (isLoading || !supplier) {
    return (
      <AppShell title={vendorLabel}>
        <p className="text-gray-500">{t('loading')}</p>
      </AppShell>
    );
  }

  const commissionTotal =
    transactions
      ?.filter((tx) => tx.type === 'income')
      .reduce((s, tx) => s + Number(tx.amount), 0) ?? 0;
  const settlementTotal =
    transactions
      ?.filter((tx) => tx.type === 'expense')
      .reduce((s, tx) => s + Number(tx.amount), 0) ?? 0;

  return (
    <AppShell title={supplier.name}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Link href="/suppliers" className="text-sm text-primary inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link href={`/suppliers/${id}/edit`}>
            <PremiumButton variant="secondary">
              <Pencil className="h-4 w-4" /> {t('edit')}
            </PremiumButton>
          </Link>
          {isMultiVendor && supplier.current_balance > 0 && (
            <Link href={`/suppliers/settle?vendor=${id}`}>
              <PremiumButton>
                <Wallet className="h-4 w-4" /> {t('recordVendorSettlement')}
              </PremiumButton>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard label={t('moneyToPay')} value={formatCurrency(supplier.current_balance)} variant="expense" />
          {isMultiVendor && (
            <>
              <MetricCard
                label={t('commissionRate')}
                value={`${Number(supplier.commission_rate ?? 0)}%`}
              />
              <MetricCard label={t('commissionThisMonth')} value={formatCurrency(commissionTotal)} variant="income" />
              <MetricCard
                label={t('vendorSettlementsThisMonth')}
                value={formatCurrency(settlementTotal)}
                variant="expense"
              />
            </>
          )}
        </div>

        {supplier.phone && <p className="text-sm text-gray-500">{supplier.phone}</p>}

        <SummaryCard title={t('settlementHistory')}>
          {transactions?.length ? (
            transactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                categoryLabel={resolveTransactionCategoryLabel(
                  tx,
                  expenseCategories ?? [],
                  incomeCategories ?? [],
                  language
                )}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 py-4">{t('noRecentActivity')}</p>
          )}
        </SummaryCard>
      </div>
    </AppShell>
  );
}
