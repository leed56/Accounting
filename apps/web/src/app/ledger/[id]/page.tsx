'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { useTranslation } from '@/components/language-switcher';
import { getJournalEntry, queryKeys } from '@bizmanager/supabase-client';
import { formatCurrency } from '@bizmanager/utils';

export default function JournalEntryDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;

  const { data: entry, isLoading } = useQuery({
    queryKey: queryKeys.journalEntry(id),
    queryFn: () => getJournalEntry(id),
    enabled: !!id,
  });

  if (isLoading || !entry) {
    return (
      <AppShell title={t('ledger')}>
        <p className="text-gray-500">{t('loading')}</p>
      </AppShell>
    );
  }

  const totalDebit = entry.lines?.reduce((s, l) => s + Number(l.debit), 0) ?? 0;
  const totalCredit = entry.lines?.reduce((s, l) => s + Number(l.credit), 0) ?? 0;

  return (
    <AppShell title={entry.description}>
      <div className="max-w-2xl space-y-4">
        <Link href="/ledger" className="text-sm text-primary">← {t('ledger')}</Link>
        <div className="card">
          <p className="text-sm text-gray-500">{entry.entry_date} · {entry.status}</p>
          {entry.reference && <p className="text-sm mt-1">{t('reference')}: {entry.reference}</p>}
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t('account')}</th>
                <th className="text-right py-2">{t('debit')}</th>
                <th className="text-right py-2">{t('credit')}</th>
              </tr>
            </thead>
            <tbody>
              {entry.lines?.map((line) => (
                <tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{line.account_code}</td>
                  <td className="text-right py-2">{Number(line.debit) > 0 ? formatCurrency(line.debit) : '—'}</td>
                  <td className="text-right py-2">{Number(line.credit) > 0 ? formatCurrency(line.credit) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="py-2">{t('total')}</td>
                <td className="text-right py-2">{formatCurrency(totalDebit)}</td>
                <td className="text-right py-2">{formatCurrency(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
