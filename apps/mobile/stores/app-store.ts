'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '@bizmanager/i18n';
import type { NotificationPreferences } from '@bizmanager/utils';
import { SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';

interface MobileState {
  language: Language;
  companyId: string | null;
  darkMode: boolean;
  notificationPrefs: NotificationPreferences;
  setLanguage: (l: Language) => void;
  setCompanyId: (id: string | null) => void;
  setDarkMode: (dark: boolean) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
}

export const useMobileStore = create<MobileState>()(
  persist(
    (set) => ({
      language: 'en',
      companyId: SAMPLE_COMPANY_ID,
      darkMode: false,
      notificationPrefs: {
        notifyApprovals: true,
        notifyPayroll: true,
        notifyLeave: true,
      },
      setLanguage: (language) => set({ language }),
      setCompanyId: (companyId) => set({ companyId }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setNotificationPrefs: (prefs) =>
        set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...prefs } })),
    }),
    {
      name: 'bizmanager-mobile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
