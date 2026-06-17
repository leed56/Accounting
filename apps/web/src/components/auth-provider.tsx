'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Profile } from '@bizmanager/types';
import { getSupabase, bootstrapSession, signOut as supaSignOut } from '@bizmanager/supabase-client';
import { useAppStore } from '@/stores/app-store';

const PUBLIC_PATHS = ['/onboarding', '/login', '/setup', '/'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/')));
}

const BOOTSTRAP_TIMEOUT_MS = 8000;

async function bootstrapWithTimeout() {
  return Promise.race([
    bootstrapSession(),
    new Promise<{ userId: null; profile: null }>((resolve) =>
      setTimeout(() => resolve({ userId: null, profile: null }), BOOTSTRAP_TIMEOUT_MS)
    ),
  ]);
}

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
  const bootstrapped = useRef(false);

  const refresh = useCallback(async () => {
    const { profile: p } = await bootstrapWithTimeout();
    setProfile(p);
    setCompanyId(p?.company_id ?? null);
  }, [setCompanyId]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    refresh().finally(() => setLoading(false));

    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'INITIAL_SESSION') return;
      await refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    if (!profile && !isPublicPath(pathname)) {
      router.replace('/login');
    }
  }, [loading, profile, pathname, router]);

  const signOut = async () => {
    await supaSignOut();
    setProfile(null);
    setCompanyId(null);
    router.replace('/login');
  };

  const showBlockingLoader = loading && !isPublicPath(pathname);

  return (
    <AuthContext.Provider value={{ profile, loading, signOut, refresh }}>
      {showBlockingLoader ? (
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
