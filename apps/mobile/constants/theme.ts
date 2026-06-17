import { colors, spacing, radius, typography } from '@bizmanager/design-tokens';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
};

export const styles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: typography.fontSize.headingLg,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.text.secondary,
  },
  metric: {
    fontSize: typography.fontSize.metric,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  label: {
    fontSize: typography.fontSize.body,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  btnPrimary: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    alignItems: 'center' as const,
    minHeight: 44,
  },
  btnPrimaryText: {
    color: colors.text.inverse,
    fontWeight: '600' as const,
    fontSize: typography.fontSize.bodyLg,
  },
};
