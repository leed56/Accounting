'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Profile } from '@bizmanager/types';
import { getSupabase, bootstrapSession, signOut as supaSignOut } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';

const PUBLIC_PATHS = ['/onboarding', '/login', '/setup'];

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const setCompanyId = useAppStore((s) => s.setCompanyId);

  const refresh = useCallback(async () => {
    const { profile: p } = await bootstrapSession();
    setProfile(p);
    if (p) setCompanyId(p.company_id);
  }, [setCompanyId]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      await refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (!profile && !isPublic && pathname !== '/') {
      router.replace('/login');
    }
  }, [loading, profile, pathname, router]);

  const signOut = async () => {
    await supaSignOut();
    setProfile(null);
    setCompanyId(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signOut, refresh }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
