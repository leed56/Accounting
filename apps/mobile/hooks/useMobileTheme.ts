import { colors as lightColors } from '@bizmanager/design-tokens';
import { useMobileStore } from '@/stores/app-store';

type ColorPalette = {
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  primary: { DEFAULT: string; light: string; dark: string };
  danger: typeof lightColors.danger;
  warning: typeof lightColors.warning;
  info: typeof lightColors.info;
  ai: { DEFAULT: string; light: string; dark: string };
  income: string;
  expense: string;
  profit: string;
  chart: typeof lightColors.chart;
  status: typeof lightColors.status;
};

const darkColors: ColorPalette = {
  ...lightColors,
  background: '#0B0F14',
  surface: '#111827',
  border: '#374151',
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    inverse: '#111827',
  },
  primary: {
    ...lightColors.primary,
    light: '#14532D',
  },
  ai: {
    ...lightColors.ai,
    light: '#2E1065',
  },
};

export function useMobileTheme() {
  const darkMode = useMobileStore((s) => s.darkMode);
  const c: ColorPalette = darkMode ? darkColors : lightColors;
  return {
    darkMode,
    colors: c,
    screen: { flex: 1 as const, backgroundColor: c.background },
    card: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
  };
}

export type MobileTheme = ReturnType<typeof useMobileTheme>;
