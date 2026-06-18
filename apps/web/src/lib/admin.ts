const DEFAULT_SUPER_ADMINS = 'appleview778@gmail.com';

export function getSuperAdminEmails(): string[] {
  const raw =
    process.env.SUPER_ADMIN_EMAILS ??
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ??
    DEFAULT_SUPER_ADMINS;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.toLowerCase());
}

export function formatSubscriptionLabel(plan: string, trialEndsAt: string | null, maxUsers: number) {
  const planLabel =
    plan === 'pro' ? 'Pro' : plan === 'small_office' ? 'Small Office' : 'Free trial';
  const trial =
    plan === 'trial' && trialEndsAt
      ? ` · trial until ${new Date(trialEndsAt).toLocaleDateString()}`
      : '';
  return `${planLabel} (up to ${maxUsers} users)${trial}`;
}
