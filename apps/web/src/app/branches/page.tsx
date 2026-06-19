'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchSchema, type BranchInput } from '@bizmanager/types';
import { AppShell } from '@/components/app-shell';
import { FormInput, TextAreaField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAppStore } from '@/stores/app-store';
import { createBranch, getBranches, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { Building, Plus } from 'lucide-react';

export default function BranchesPage() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [showForm, setShowForm] = useState(false);

  const { data: branches } = useQuery({
    queryKey: queryKeys.branches(companyId),
    queryFn: () => getBranches(companyId),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: { isDefault: false },
  });

  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches(companyId) });
      toast(t('success'), 'success');
      reset();
      setShowForm(false);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <AppShell title={t('branches')}>
      <div className="space-y-6 max-w-2xl">
        <PremiumButton onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />{t('addBranch')}
        </PremiumButton>

        {showForm && (
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
            <FormInput label={t('branchName')} required error={errors.name?.message} {...register('name')} />
            <FormInput label="Phone" {...register('phone')} />
            <TextAreaField label="Address" {...register('address')} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isDefault')} className="rounded" />
              {t('defaultBranch')}
            </label>
            <PremiumButton type="submit" loading={mutation.isPending}>{t('save')}</PremiumButton>
          </form>
        )}

        <div className="grid gap-4">
          {branches?.map((b) => (
            <div key={b.id} className="card flex items-start gap-3">
              <Building className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {b.name}{' '}
                  {b.is_default && <span className="text-xs text-primary">({t('defaultBranch')})</span>}
                </p>
                {b.address && <p className="text-sm text-gray-500">{b.address}</p>}
                {b.phone && <p className="text-sm text-gray-500">{b.phone}</p>}
              </div>
            </div>
          ))}
          {!branches?.length && <p className="text-gray-500 text-center py-8">{t('noBranches')}</p>}
        </div>
      </div>
    </AppShell>
  );
}
