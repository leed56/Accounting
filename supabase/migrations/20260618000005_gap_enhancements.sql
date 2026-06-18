-- Gap enhancements: business types, payment metadata, push tokens, subscription fields

ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'grocery_kade';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'textile_shop';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'multi_vendor';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'guesthouse';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'pharmacy';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'agriculture';

DO $$ BEGIN
  CREATE TYPE cheque_status AS ENUM ('pending', 'cleared', 'bounced', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('trial', 'small_office', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS cheque_number TEXT,
  ADD COLUMN IF NOT EXISTS cheque_status cheque_status,
  ADD COLUMN IF NOT EXISTS cheque_cleared_at TIMESTAMPTZ;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS max_users INT NOT NULL DEFAULT 3;

CREATE TABLE IF NOT EXISTS device_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_transactions_cheque_status
  ON transactions(company_id, cheque_status)
  WHERE payment_method = 'cheque';

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_company
  ON device_push_tokens(company_id, is_active);

ALTER TABLE device_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS push_tokens_own ON device_push_tokens;
CREATE POLICY push_tokens_own ON device_push_tokens FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
