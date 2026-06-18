import { useQuery } from '@tanstack/react-query';
import { bootstrapSession, isDemoMode } from '@bizmanager/supabase-client';

export async function resolveMobileProfileId(): Promise<string | null> {
  const { profile } = await bootstrapSession();
  if (profile?.id) return profile.id;
  if (isDemoMode()) return 'profile-1';
  return null;
}

export function useMobileProfileId() {
  return useQuery({
    queryKey: ['mobile-profile-id'],
    queryFn: resolveMobileProfileId,
    staleTime: 5 * 60 * 1000,
  });
}
