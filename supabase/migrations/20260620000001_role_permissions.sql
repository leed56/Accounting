-- Company-configurable role permissions (Sri Lanka: chief accountant may act as admin)
-- Migration: 20260620000001_role_permissions

ALTER TABLE companies ADD COLUMN IF NOT EXISTS role_permissions JSONB NOT NULL DEFAULT '{
  "manager": {
    "can_write": true,
    "can_approve": false,
    "can_invite": false,
    "can_manage_settings": false
  },
  "accountant": {
    "can_write": false,
    "can_approve": false,
    "can_invite": false,
    "can_manage_settings": false
  },
  "staff": {
    "can_write": false,
    "can_approve": false,
    "can_invite": false,
    "can_manage_settings": false
  }
}'::jsonb;

CREATE OR REPLACE FUNCTION get_company_role_permissions()
RETURNS JSONB AS $$
  SELECT COALESCE(
    (SELECT role_permissions FROM companies WHERE id = get_user_company_id()),
    '{}'::jsonb
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_role_permission(perm TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  r user_role;
  perms JSONB;
BEGIN
  r := get_user_role();
  IF r = 'owner' THEN
    RETURN true;
  END IF;
  perms := get_company_role_permissions()->r::text;
  IF perms IS NULL THEN
    RETURN false;
  END IF;
  RETURN COALESCE((perms->>perm)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS transactions_insert ON transactions;
CREATE POLICY transactions_insert ON transactions FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id()
    AND (is_manager_or_owner() OR has_role_permission('can_write'))
  );

DROP POLICY IF EXISTS transactions_update ON transactions;
CREATE POLICY transactions_update ON transactions FOR UPDATE
  USING (
    company_id = get_user_company_id()
    AND (
      is_owner()
      OR has_role_permission('can_approve')
      OR (is_manager_or_owner() AND status = 'pending')
    )
  );

DROP POLICY IF EXISTS payment_requests_update ON payment_requests;
CREATE POLICY payment_requests_update ON payment_requests FOR UPDATE
  USING (company_id = get_user_company_id() AND (is_owner() OR has_role_permission('can_approve')));

DROP POLICY IF EXISTS companies_update ON companies;
CREATE POLICY companies_update ON companies FOR UPDATE
  USING (id = get_user_company_id() AND (is_owner() OR has_role_permission('can_manage_settings')));

DROP POLICY IF EXISTS categories_all ON expense_categories;
CREATE POLICY categories_all ON expense_categories FOR ALL
  USING (company_id = get_user_company_id() AND (is_owner() OR has_role_permission('can_manage_settings')));
