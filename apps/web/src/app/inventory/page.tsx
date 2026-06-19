'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getProducts, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { Package, Plus, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: products } = useQuery({
    queryKey: queryKeys.products(companyId),
    queryFn: () => getProducts(companyId),
  });

  const lowStock = products?.filter((p) => p.quantity_on_hand <= p.reorder_level) ?? [];

  return (
    <AppShell title={t('inventory')}>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <MetricCard label={t('products')} value={String(products?.length ?? 0)} className="max-w-xs" />
          <Link href="/inventory/add">
            <PremiumButton><Plus className="h-4 w-4" />{t('addProduct')}</PremiumButton>
          </Link>
        </div>

        {lowStock.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {lowStock.length} {t('lowStockAlert')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((p) => (
            <Link key={p.id} href={`/inventory/${p.id}`} className="card hover:shadow-md transition-shadow">
              <h3 className="font-semibold">{p.name}</h3>
              {p.sku && <p className="text-xs text-gray-500 mt-1">SKU: {p.sku}</p>}
              <p className="text-2xl font-bold mt-2">
                {p.quantity_on_hand} <span className="text-sm font-normal text-gray-500">{p.unit}</span>
              </p>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Cost: {formatCurrency(p.cost_price)}</span>
                <span>Sale: {formatCurrency(p.sale_price)}</span>
              </div>
            </Link>
          ))}
        </div>

        {!products?.length && (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title={t('noProducts')}
            description={t('noProductsDesc')}
            action={
              <Link href="/inventory/add">
                <PremiumButton><Plus className="h-4 w-4" />{t('addProduct')}</PremiumButton>
              </Link>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
