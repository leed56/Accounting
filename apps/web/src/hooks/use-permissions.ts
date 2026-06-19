'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth-provider';
import { useAppStore } from '@/stores/app-store';
import { getCompany, queryKeys, SAMPLE_COMPANY_ID } from '@bizmanager/supabase-client';
import { parseCompanyRolePermissions, resolvePermissions } from '@bizmanager/utils';
import type { UserRole } from '@bizmanager/types';

export function usePermissions() {
  const { profile } = useAuth();
  const companyId = useAppStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const role = (profile?.role ?? 'staff') as UserRole;

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
    enabled: !!companyId,
  });

  const permissions = parseCompanyRolePermissions(company?.role_permissions);
  const resolved = resolvePermissions(role, permissions);

  return {
    role,
    permissions,
    ...resolved,
    isAccountant: role === 'accountant',
    isOwner: role === 'owner',
  };
}
