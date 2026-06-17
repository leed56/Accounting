'use client';

import { useAuth } from '@/components/auth-provider';
import type { UserRole } from '@bizmanager/types';

export function usePermissions() {
  const { profile } = useAuth();
  const role = (profile?.role ?? 'staff') as UserRole;

  const canWrite = role === 'owner' || role === 'manager';
  const canApprove = role === 'owner';
  const canManageSettings = role === 'owner';
  const canInvite = role === 'owner';
  const isReadOnly = role === 'accountant';

  return {
    role,
    canWrite,
    canApprove,
    canManageSettings,
    canInvite,
    isReadOnly,
    isAccountant: role === 'accountant',
  };
}
