-- Sprint 19: accounting modules (branches, inventory, ledger, settlements, bank recon)
-- Migration: 20260619000001_accounting_modules

CREATE TYPE settlement_status AS ENUM ('draft', 'submitted', 'approved', 'paid', 'cancelled');
CREATE TYPE reconciliation_status AS ENUM ('open', 'closed');

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id);

-- Supplier commission rate + optional branch
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Branch on core tables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Inventory-lite
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  sku TEXT,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  cost_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  quantity_on_hand NUMERIC(15,3) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(15,3) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC(15,3) NOT NULL,
  unit_cost NUMERIC(15,2),
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);

-- Double-entry lite (journal)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'void')),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  debit NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit NUMERIC(15,2) NOT NULL DEFAULT 0,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_company ON journal_entries(company_id, entry_date);

-- Batch vendor settlements
CREATE TABLE IF NOT EXISTS settlement_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status settlement_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settlement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_run_id UUID NOT NULL REFERENCES settlement_runs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_settlement_runs_company ON settlement_runs(company_id);

-- Bank reconciliation
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  status reconciliation_status NOT NULL DEFAULT 'open',
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_statement_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reconciliation_id UUID NOT NULL REFERENCES bank_reconciliations(id) ON DELETE CASCADE,
  line_date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(15,2) NOT NULL,
  reference TEXT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  is_matched BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_bank_recon_company ON bank_reconciliations(company_id);

-- RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statement_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY branches_all ON branches FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY branches_select ON branches FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY products_all ON products FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY products_select ON products FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY stock_movements_all ON stock_movements FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY stock_movements_select ON stock_movements FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY journal_entries_all ON journal_entries FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY journal_entries_select ON journal_entries FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY journal_lines_select ON journal_lines FOR SELECT USING (
  journal_entry_id IN (SELECT id FROM journal_entries WHERE company_id = get_user_company_id())
);
CREATE POLICY journal_lines_write ON journal_lines FOR ALL USING (
  journal_entry_id IN (SELECT id FROM journal_entries WHERE company_id = get_user_company_id() AND is_manager_or_owner())
);

CREATE POLICY settlement_runs_all ON settlement_runs FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY settlement_runs_select ON settlement_runs FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY settlement_runs_approve ON settlement_runs FOR UPDATE USING (company_id = get_user_company_id() AND is_owner());

CREATE POLICY settlement_items_select ON settlement_items FOR SELECT USING (
  settlement_run_id IN (SELECT id FROM settlement_runs WHERE company_id = get_user_company_id())
);
CREATE POLICY settlement_items_write ON settlement_items FOR ALL USING (
  settlement_run_id IN (SELECT id FROM settlement_runs WHERE company_id = get_user_company_id() AND is_manager_or_owner())
);

CREATE POLICY bank_recon_all ON bank_reconciliations FOR ALL USING (company_id = get_user_company_id() AND is_manager_or_owner());
CREATE POLICY bank_recon_select ON bank_reconciliations FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY bank_lines_select ON bank_statement_lines FOR SELECT USING (
  reconciliation_id IN (SELECT id FROM bank_reconciliations WHERE company_id = get_user_company_id())
);
CREATE POLICY bank_lines_write ON bank_statement_lines FOR ALL USING (
  reconciliation_id IN (SELECT id FROM bank_reconciliations WHERE company_id = get_user_company_id() AND is_manager_or_owner())
);
