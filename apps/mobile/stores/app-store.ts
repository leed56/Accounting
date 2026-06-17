'use client';

import { create } from 'zustand';
import type { Language } from '@bizmanager/i18n';

interface MobileState {
  language: Language;
  companyId: string;
  setLanguage: (l: Language) => void;
}

export const useMobileStore = create<MobileState>((set) => ({
  language: 'en',
  companyId: '00000000-0000-4000-8000-000000000001',
  setLanguage: (language) => set({ language }),
}));
