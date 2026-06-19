import type { UserRole } from '@bizmanager/types';

export type RolePermissionKey = 'can_write' | 'can_approve' | 'can_invite' | 'can_manage_settings';

export type RolePermissionFlags = {
  can_write: boolean;
  can_approve: boolean;
  can_invite: boolean;
  can_manage_settings: boolean;
};

export type CompanyRolePermissions = {
  manager: RolePermissionFlags;
  accountant: RolePermissionFlags;
  staff: RolePermissionFlags;
};

export const DEFAULT_ROLE_PERMISSIONS: CompanyRolePermissions = {
  manager: {
    can_write: true,
    can_approve: false,
    can_invite: false,
    can_manage_settings: false,
  },
  accountant: {
    can_write: false,
    can_approve: false,
    can_invite: false,
    can_manage_settings: false,
  },
  staff: {
    can_write: false,
    can_approve: false,
    can_invite: false,
    can_manage_settings: false,
  },
};

/** Chief accountant preset common in Sri Lanka — full admin except owner identity */
export const CHIEF_ACCOUNTANT_PERMISSIONS: RolePermissionFlags = {
  can_write: true,
  can_approve: true,
  can_invite: true,
  can_manage_settings: true,
};

export function parseCompanyRolePermissions(raw: unknown): CompanyRolePermissions {
  const base = structuredClone(DEFAULT_ROLE_PERMISSIONS);
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Record<string, Partial<RolePermissionFlags>>;
  for (const role of ['manager', 'accountant', 'staff'] as const) {
    const row = obj[role];
    if (!row) continue;
    base[role] = {
      can_write: row.can_write ?? base[role].can_write,
      can_approve: row.can_approve ?? base[role].can_approve,
      can_invite: row.can_invite ?? base[role].can_invite,
      can_manage_settings: row.can_manage_settings ?? base[role].can_manage_settings,
    };
  }
  return base;
}

export function resolvePermissions(
  role: UserRole,
  permissions: CompanyRolePermissions
): {
  canWrite: boolean;
  canApprove: boolean;
  canInvite: boolean;
  canManageSettings: boolean;
  isReadOnly: boolean;
} {
  if (role === 'owner') {
    return {
      canWrite: true,
      canApprove: true,
      canInvite: true,
      canManageSettings: true,
      isReadOnly: false,
    };
  }

  const flags =
    role === 'manager'
      ? permissions.manager
      : role === 'accountant'
        ? permissions.accountant
        : role === 'staff'
          ? permissions.staff
          : DEFAULT_ROLE_PERMISSIONS.staff;

  const canWrite = flags.can_write;
  const canApprove = flags.can_approve;
  const canInvite = flags.can_invite;
  const canManageSettings = flags.can_manage_settings;

  return {
    canWrite,
    canApprove,
    canInvite,
    canManageSettings,
    isReadOnly: !canWrite && !canApprove && !canManageSettings,
  };
}

export function hasPermission(
  role: UserRole,
  permissions: CompanyRolePermissions,
  key: RolePermissionKey
): boolean {
  if (role === 'owner') return true;
  const flags =
    role === 'manager'
      ? permissions.manager
      : role === 'accountant'
        ? permissions.accountant
        : permissions.staff;
  return flags[key];
}
