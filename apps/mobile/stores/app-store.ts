'use client';

import { create } from 'zustand';
import type { Language } from '@bizmanager/i18n';
import { SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';

interface MobileState {
  language: Language;
  companyId: string | null;
  setLanguage: (l: Language) => void;
  setCompanyId: (id: string | null) => void;
}

export const useMobileStore = create<MobileState>((set) => ({
  language: 'en',
  companyId: SAMPLE_COMPANY_ID,
  setLanguage: (language) => set({ language }),
  setCompanyId: (companyId) => set({ companyId }),
}));
