'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@bizmanager/i18n';
import type { PeriodType } from '@bizmanager/types';

export interface NotificationPreferences {
  notifyApprovals: boolean;
  notifyPayroll: boolean;
  notifyLeave: boolean;
}

interface AppState {
  language: Language;
  period: PeriodType;
  sidebarOpen: boolean;
  demoMode: boolean;
  companyId: string | null;
  darkMode: boolean;
  notificationPrefs: NotificationPreferences;
  setLanguage: (lang: Language) => void;
  setPeriod: (period: PeriodType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCompanyId: (id: string | null) => void;
  setDarkMode: (dark: boolean) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      period: 'daily',
      sidebarOpen: true,
      demoMode: false,
      companyId: '00000000-0000-4000-8000-000000000001',
      darkMode: false,
      notificationPrefs: {
        notifyApprovals: true,
        notifyPayroll: true,
        notifyLeave: true,
      },
      setLanguage: (language) => set({ language }),
      setPeriod: (period) => set({ period }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCompanyId: (companyId) => set({ companyId }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setNotificationPrefs: (prefs) =>
        set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...prefs } })),
    }),
    { name: 'bizmanager-web' }
  )
);
