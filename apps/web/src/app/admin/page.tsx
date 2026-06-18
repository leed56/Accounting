'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { BUSINESS_TYPES } from '@bizmanager/types';
import { z } from 'zod';
import { AppShell } from '@/components/app-shell';
import { FormInput, SelectField } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useTranslation } from '@/components/language-switcher';
import { useToast } from '@/components/toast';
import { useAuth } from '@/components/auth-provider';
import { getSession } from '@bizmanager/supabase-client';
import { BUSINESS_TYPE_LABEL_KEYS, BUSINESS_TYPE_SETUP_ORDER } from '@bizmanager/utils';
import { isSuperAdminEmail } from '@/lib/admin';
import { useRouter } from 'next/navigation';

const createSchema = z.object({
  email: z.string().email(),
  ownerName: z.string().min(2),
  businessName: z.string().min(2),
  businessType: z.enum(BUSINESS_TYPES),
  tempPassword: z.string().min(6).optional().or(z.literal('')),
  language: z.enum(['en', 'si', 'ta']),
});

type CreateForm = z.infer<typeof createSchema>;

export default function AdminPage() {
  const { t } = useTranslation();
  const toast = useToast((s) => s.show);
  const { profile } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [lastResult, setLastResult] = useState<{ email: string; tempPassword?: string } | null>(null);

  const isAdmin = isSuperAdminEmail(profile?.email);

  useEffect(() => {
    if (profile && !isAdmin) router.replace('/dashboard');
  }, [profile, isAdmin, router]);

  const { data: companies, refetch } = useQuery({
    queryKey: ['admin-companies'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data: { session } } = await getSession();
      if (!session?.access_token) throw new Error('Not signed in');
      const res = await fetch('/api/admin/companies', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load');
      return json.companies as Array<{
        id: string;
        name: string;
        business_type: string;
        owner_name: string | null;
        subscription_plan: string;
        max_users: number;
        created_at: string;
      }>;
    },
  });

  const { register, handleSubmit, reset } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { language: 'en', businessType: 'grocery_kade' },
  });

  const onCreate = handleSubmit(async (data) => {
    setCreating(true);
    setLastResult(null);
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) throw new Error('Not signed in');
      const res = await fetch('/api/admin/create-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...data,
          tempPassword: data.tempPassword || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Create failed');
      setLastResult({ email: json.email, tempPassword: json.tempPassword });
      toast(t('success'), 'success');
      reset({ language: 'en', businessType: 'grocery_kade', email: '', ownerName: '', businessName: '', tempPassword: '' });
      refetch();
    } catch (e) {
      toast(e instanceof Error ? e.message : t('error'), 'error');
    } finally {
      setCreating(false);
    }
  });

  if (!isAdmin) return null;

  return (
    <AppShell title={t('adminPanel')}>
      <div className="max-w-4xl space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">{t('createCompany')}</h2>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label={t('email')} required {...register('email')} />
            <FormInput label={t('fullName')} required {...register('ownerName')} />
            <FormInput label={t('businessName')} required {...register('businessName')} />
            <SelectField
              label={t('businessType')}
              options={BUSINESS_TYPE_SETUP_ORDER.map((type) => ({
                value: type,
                label: t(BUSINESS_TYPE_LABEL_KEYS[type]),
              }))}
              {...register('businessType')}
            />
            <FormInput label={t('password')} {...register('tempPassword')} />
            <SelectField
              label={t('languagePreference')}
              options={[
                { value: 'en', label: 'English' },
                { value: 'si', label: 'සිංහල' },
                { value: 'ta', label: 'தமிழ்' },
              ]}
              {...register('language')}
            />
            <div className="md:col-span-2">
              <PremiumButton type="submit" loading={creating}>{t('createCompany')}</PremiumButton>
            </div>
          </form>
          {lastResult && (
            <p className="text-sm bg-green-50 text-green-800 rounded-lg p-3">
              {lastResult.email}
              {lastResult.tempPassword ? ` · Password: ${lastResult.tempPassword}` : ''}
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-4">{t('allCompanies')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">{t('businessName')}</th>
                  <th className="py-2 pr-4">{t('businessType')}</th>
                  <th className="py-2 pr-4">{t('ownerName')}</th>
                  <th className="py-2">{t('subscription')}</th>
                </tr>
              </thead>
              <tbody>
                {companies?.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">{c.name}</td>
                    <td className="py-2 pr-4">{c.business_type.replace(/_/g, ' ')}</td>
                    <td className="py-2 pr-4">{c.owner_name}</td>
                    <td className="py-2">{c.subscription_plan} · {c.max_users} users</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
