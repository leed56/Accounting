export const colors = {
  background: '#FAFBFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  primary: {
    DEFAULT: '#16A34A',
    light: '#DCFCE7',
    dark: '#15803D',
  },
  danger: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    dark: '#2563EB',
  },
  ai: {
    DEFAULT: '#8B5CF6',
    light: '#EDE9FE',
    dark: '#7C3AED',
  },
  income: '#16A34A',
  expense: '#EF4444',
  profit: '#3B82F6',
  chart: {
    income: '#16A34A',
    expense: '#F87171',
    profit: '#3B82F6',
    warning: '#F59E0B',
    ai: '#8B5CF6',
  },
  status: {
    pending: '#F59E0B',
    approved: '#16A34A',
    rejected: '#EF4444',
    paid: '#3B82F6',
    cancelled: '#9CA3AF',
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.08)',
  elevated: '0 8px 24px rgba(0, 0, 0, 0.12)',
  modal: '0 20px 40px rgba(0, 0, 0, 0.15)',
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    sinhala: '"Noto Sans Sinhala", Inter, sans-serif',
    tamil: '"Noto Sans Tamil", Inter, sans-serif',
  },
  fontSize: {
    caption: 12,
    body: 14,
    bodyLg: 16,
    heading: 20,
    headingLg: 24,
    title: 28,
    metric: 32,
    metricLg: 40,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const card = {
  background: colors.surface,
  borderRadius: radius.lg,
  padding: spacing[4],
  shadow: shadows.card,
} as const;

export const button = {
  height: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  borderRadius: radius.md,
  paddingHorizontal: spacing[4],
} as const;

export * from './tailwind';
