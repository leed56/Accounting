import { colors, radius, spacing } from './index';

export const tailwindTheme = {
  colors: {
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    primary: colors.primary,
    danger: colors.danger,
    warning: colors.warning,
    info: colors.info,
    ai: colors.ai,
    income: colors.income,
    expense: colors.expense,
    profit: colors.profit,
  },
  borderRadius: {
    sm: `${radius.sm}px`,
    md: `${radius.md}px`,
    lg: `${radius.lg}px`,
    xl: `${radius.xl}px`,
  },
  spacing: Object.fromEntries(
    Object.entries(spacing).map(([k, v]) => [k, `${v}px`])
  ),
};
