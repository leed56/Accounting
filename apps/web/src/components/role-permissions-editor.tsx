'use client';

import type { CompanyRolePermissionsJson } from '@bizmanager/types';
import {
  CHIEF_ACCOUNTANT_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  type CompanyRolePermissions,
} from '@bizmanager/utils';
import { PremiumButton } from './premium-button';
import { useTranslation } from './language-switcher';

type Props = {
  value: CompanyRolePermissions;
  onChange: (next: CompanyRolePermissions) => void;
  disabled?: boolean;
};

function PermissionRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm py-1.5">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
      />
    </label>
  );
}

function flagsToJson(flags: CompanyRolePermissions['manager']): CompanyRolePermissionsJson['manager'] {
  return { ...flags };
}

export function jsonToRolePermissions(json: CompanyRolePermissionsJson | null | undefined): CompanyRolePermissions {
  if (!json) return structuredClone(DEFAULT_ROLE_PERMISSIONS);
  return {
    manager: { ...DEFAULT_ROLE_PERMISSIONS.manager, ...json.manager },
    accountant: { ...DEFAULT_ROLE_PERMISSIONS.accountant, ...json.accountant },
    staff: { ...DEFAULT_ROLE_PERMISSIONS.staff, ...json.staff },
  };
}

export function rolePermissionsToJson(perms: CompanyRolePermissions): CompanyRolePermissionsJson {
  return {
    manager: flagsToJson(perms.manager),
    accountant: flagsToJson(perms.accountant),
    staff: flagsToJson(perms.staff),
  };
}

export function RolePermissionsEditor({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();

  const updateRole = (
    role: keyof CompanyRolePermissions,
    key: keyof CompanyRolePermissions['manager'],
    checked: boolean
  ) => {
    onChange({
      ...value,
      [role]: { ...value[role], [key]: checked },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">{t('rolePermissionsDesc')}</p>

      <div className="flex flex-wrap gap-2">
        <PremiumButton
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            onChange({
              ...value,
              accountant: { ...CHIEF_ACCOUNTANT_PERMISSIONS },
            })
          }
        >
          {t('presetChiefAccountant')}
        </PremiumButton>
        <PremiumButton
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onChange(structuredClone(DEFAULT_ROLE_PERMISSIONS))}
        >
          {t('presetStandardRoles')}
        </PremiumButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
          <h4 className="font-semibold mb-3">{t('roleManager')}</h4>
          <PermissionRow
            label={t('permCanWrite')}
            checked={value.manager.can_write}
            disabled={disabled}
            onChange={(v) => updateRole('manager', 'can_write', v)}
          />
          <PermissionRow
            label={t('permCanApprove')}
            checked={value.manager.can_approve}
            disabled={disabled}
            onChange={(v) => updateRole('manager', 'can_approve', v)}
          />
          <PermissionRow
            label={t('permCanInvite')}
            checked={value.manager.can_invite}
            disabled={disabled}
            onChange={(v) => updateRole('manager', 'can_invite', v)}
          />
          <PermissionRow
            label={t('permCanManageSettings')}
            checked={value.manager.can_manage_settings}
            disabled={disabled}
            onChange={(v) => updateRole('manager', 'can_manage_settings', v)}
          />
        </div>

        <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
          <h4 className="font-semibold mb-3">{t('roleAccountant')}</h4>
          <PermissionRow
            label={t('permCanWrite')}
            checked={value.accountant.can_write}
            disabled={disabled}
            onChange={(v) => updateRole('accountant', 'can_write', v)}
          />
          <PermissionRow
            label={t('permCanApprove')}
            checked={value.accountant.can_approve}
            disabled={disabled}
            onChange={(v) => updateRole('accountant', 'can_approve', v)}
          />
          <PermissionRow
            label={t('permCanInvite')}
            checked={value.accountant.can_invite}
            disabled={disabled}
            onChange={(v) => updateRole('accountant', 'can_invite', v)}
          />
          <PermissionRow
            label={t('permCanManageSettings')}
            checked={value.accountant.can_manage_settings}
            disabled={disabled}
            onChange={(v) => updateRole('accountant', 'can_manage_settings', v)}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">{t('rolePermissionsOwnerNote')}</p>
    </div>
  );
}
