'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@bizmanager/i18n';
import type { PeriodType } from '@bizmanager/types';

interface AppState {
  language: Language;
  period: PeriodType;
  sidebarOpen: boolean;
  demoMode: boolean;
  companyId: string | null;
  setLanguage: (lang: Language) => void;
  setPeriod: (period: PeriodType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCompanyId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      period: 'daily',
      sidebarOpen: true,
      demoMode: false,
      companyId: '00000000-0000-4000-8000-000000000001',
      setLanguage: (language) => set({ language }),
      setPeriod: (period) => set({ period }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCompanyId: (companyId) => set({ companyId }),
    }),
    { name: 'bizmanager-web' }
  )
);
