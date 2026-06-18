-- Allow owners to hide expense categories without deleting historical transactions
ALTER TABLE expense_categories
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
