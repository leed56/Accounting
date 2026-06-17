-- BizManager initial schema
-- Migration: 20260617000001_initial_schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'salary', 'supplier_payment', 'customer_payment', 'staff_advance', 'refund', 'transfer');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'paid', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'cheque', 'lankaqr', 'online', 'other');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'late', 'leave');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'casual', 'no_pay', 'other');
CREATE TYPE payroll_status AS ENUM ('draft', 'submitted', 'approved', 'paid', 'cancelled');
CREATE TYPE payment_request_type AS ENUM ('expense', 'salary', 'supplier', 'advance', 'other');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE account_type AS ENUM ('cash', 'bank');
CREATE TYPE business_type AS ENUM ('travel_agency', 'retail_shop', 'service_business', 'office_admin', 'restaurant_cafe', 'freelancer_agency', 'other');

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_type business_type NOT NULL DEFAULT 'other',
  currency TEXT NOT NULL DEFAULT 'LKR',
  default_language TEXT NOT NULL DEFAULT 'en',
  owner_name TEXT,
  tax_enabled BOOLEAN NOT NULL DEFAULT false,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  sscl_enabled BOOLEAN NOT NULL DEFAULT false,
  sscl_rate NUMERIC(5,2) NOT NULL DEFAULT 2.5,
  service_charge_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  staff_module_enabled BOOLEAN NOT NULL DEFAULT true,
  approval_auto_limit NUMERIC(15,2) NOT NULL DEFAULT 5000,
  timezone TEXT NOT NULL DEFAULT 'Asia/Colombo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'owner',
  language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(auth_user_id)
);

-- Accounts (cash/bank)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  salary_type TEXT NOT NULL DEFAULT 'monthly',
  joined_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense categories
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  category TEXT,
  amount NUMERIC(15,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  status transaction_status NOT NULL DEFAULT 'pending',
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  notes TEXT,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, staff_id, date)
);

-- Leave requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL DEFAULT 'casual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payroll runs
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_basic NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_advances NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_payable NUMERIC(15,2) NOT NULL DEFAULT 0,
  status payroll_status NOT NULL DEFAULT 'draft',
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, month, year)
);

-- Payroll items
CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  allowance NUMERIC(15,2) NOT NULL DEFAULT 0,
  overtime NUMERIC(15,2) NOT NULL DEFAULT 0,
  advance NUMERIC(15,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
  no_pay_deduction NUMERIC(15,2) NOT NULL DEFAULT 0,
  epf_employee NUMERIC(15,2) NOT NULL DEFAULT 0,
  epf_employer NUMERIC(15,2) NOT NULL DEFAULT 0,
  etf_employer NUMERIC(15,2) NOT NULL DEFAULT 0,
  apit NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_payable NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment requests
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  request_type payment_request_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category TEXT,
  payee_name TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE SET NULL,
  description TEXT,
  payment_method payment_method,
  risk_level risk_level NOT NULL DEFAULT 'low',
  ai_note TEXT,
  status transaction_status NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejected_reason TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  related_type TEXT NOT NULL,
  related_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  language TEXT NOT NULL DEFAULT 'en',
  related_type TEXT,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_type TEXT,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval rules
CREATE TABLE approval_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  threshold_amount NUMERIC(15,2) NOT NULL DEFAULT 5000,
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  requires_owner BOOLEAN NOT NULL DEFAULT true
);

-- Indexes
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_auth ON profiles(auth_user_id);
CREATE INDEX idx_transactions_company_date ON transactions(company_id, transaction_date);
CREATE INDEX idx_transactions_status ON transactions(company_id, status);
CREATE INDEX idx_attendance_company_date ON attendance(company_id, date);
CREATE INDEX idx_payment_requests_status ON payment_requests(company_id, status);
CREATE INDEX idx_staff_company ON staff(company_id);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_suppliers_company ON suppliers(company_id);

-- RLS helper functions
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'owner';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager_or_owner()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('owner', 'manager');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY companies_select ON companies FOR SELECT USING (id = get_user_company_id());
CREATE POLICY companies_update ON companies FOR UPDATE USING (id = get_user_company_id() AND is_owner());
CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (true);

CREATE POLICY profiles_select ON profiles FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth_user_id = auth.uid() OR is_owner());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (company_id = get_user_company_id() AND (is_owner() OR auth_user_id = auth.uid()));

CREATE POLICY accounts_all ON accounts FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY staff_select ON staff FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY staff_write ON staff FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());

CREATE POLICY customers_all ON customers FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY customers_select ON customers FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY suppliers_all ON suppliers FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY suppliers_select ON suppliers FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY categories_all ON expense_categories FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY transactions_select ON transactions FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY transactions_insert ON transactions FOR INSERT WITH CHECK (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY transactions_update ON transactions FOR UPDATE USING (company_id = get_user_company_id() AND (is_owner() OR (is_manager_or_owner() AND status = 'pending')));

CREATE POLICY attendance_all ON attendance FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY attendance_select ON attendance FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY leave_select ON leave_requests FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY leave_insert ON leave_requests FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY leave_update ON leave_requests FOR UPDATE USING (company_id = get_user_company_id() AND is_owner());

CREATE POLICY payroll_select ON payroll_runs FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY payroll_write ON payroll_runs FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY payroll_approve ON payroll_runs FOR UPDATE USING (company_id = get_user_company_id() AND is_owner());

CREATE POLICY payroll_items_select ON payroll_items FOR SELECT USING (
  payroll_run_id IN (SELECT id FROM payroll_runs WHERE company_id = get_user_company_id())
);

CREATE POLICY payment_requests_select ON payment_requests FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY payment_requests_insert ON payment_requests FOR INSERT WITH CHECK (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY payment_requests_update ON payment_requests FOR UPDATE USING (company_id = get_user_company_id() AND is_owner());

CREATE POLICY attachments_all ON attachments FOR ALL USING (company_id = get_user_company_id());
CREATE POLICY ai_insights_select ON ai_insights FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY ai_insights_insert ON ai_insights FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY notifications_all ON notifications FOR ALL USING (company_id = get_user_company_id() AND user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY approval_rules_all ON approval_rules FOR ALL USING (company_id = get_user_company_id() AND is_owner());
