import type { Profile } from '@bizmanager/types';
import { getSupabase } from './client';
import { isDemoMode } from './queries';

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getCurrentProfile(sessionUserId?: string | null): Promise<Profile | null> {
  if (isDemoMode()) return null;
  const userId = sessionUserId ?? (await getCurrentUserId());
  if (!userId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function bootstrapSession(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) return { userId: null, profile: null };
    const userId = data.session?.user?.id ?? null;
    if (!userId) return { userId: null, profile: null };
    const profile = await getCurrentProfile(userId);
    return { userId, profile };
  } catch {
    return { userId: null, profile: null };
  }
}
