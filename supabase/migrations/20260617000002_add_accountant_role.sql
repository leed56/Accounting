-- Accountant: read-only access (inherits existing SELECT policies; excluded from is_manager_or_owner writes)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';
