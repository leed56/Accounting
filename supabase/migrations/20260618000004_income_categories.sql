-- Income categories (mirrors expense_categories)
CREATE TABLE income_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_income_categories_company ON income_categories(company_id);

ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY income_categories_all ON income_categories FOR ALL USING (company_id = get_user_company_id());
