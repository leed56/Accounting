import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { bootstrapSession } from '@bizmanager/supabase-client';
import { useMobileStore } from '@/stores/app-store';

export default function Index() {
  const setCompanyId = useMobileStore((s) => s.setCompanyId);

  useEffect(() => {
    bootstrapSession().then(({ profile }) => {
      if (profile?.company_id) setCompanyId(profile.company_id);
    });
  }, [setCompanyId]);

  return <Redirect href="/onboarding" />;
}
