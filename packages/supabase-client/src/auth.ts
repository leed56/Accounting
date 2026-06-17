import type { Profile } from '@bizmanager/types';
import { getSupabase } from './client';
import { isDemoMode } from './queries';

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (isDemoMode()) return null;
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function bootstrapSession(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id ?? null;
  if (!userId) return { userId: null, profile: null };
  const profile = await getCurrentProfile();
  return { userId, profile };
}
