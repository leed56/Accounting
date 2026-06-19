'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useAppStore } from '@/stores/app-store';
import { getJournalEntries, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';
import { BookOpen, Plus } from 'lucide-react';

export default function LedgerPage() {
  const { t } = useTranslation();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;

  const { data: entries } = useQuery({
    queryKey: queryKeys.journalEntries(companyId),
    queryFn: () => getJournalEntries(companyId),
  });

  return (
    <AppShell title={t('ledger')}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/ledger/add">
            <PremiumButton><Plus className="h-4 w-4" />{t('addJournalEntry')}</PremiumButton>
          </Link>
        </div>
        <div className="space-y-3">
          {entries?.map((e) => (
            <Link key={e.id} href={`/ledger/${e.id}`} className="card block hover:shadow-md transition-shadow">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">{e.description}</p>
                  <p className="text-sm text-gray-500">{e.entry_date} {e.reference ? `· ${e.reference}` : ''}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${e.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {e.status}
                </span>
              </div>
            </Link>
          ))}
          {!entries?.length && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>{t('noJournalEntries')}</p>
              <Link href="/ledger/add" className="inline-block mt-4">
                <PremiumButton variant="secondary">{t('addJournalEntry')}</PremiumButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
