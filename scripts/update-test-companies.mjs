/**
 * Update existing test company business types + seed categories
 * Usage: npx tsx scripts/update-test-companies.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getExpenseCategoriesForBusinessType } from '../packages/utils/src/category.ts';
import { getIncomeCategoriesForBusinessType } from '../packages/utils/src/income-category.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEST_COMPANIES = [
  { email: 'bizmanager-test-ac@gmail.com', businessType: 'workshop_repair' },
  { email: 'bizmanager-test-grocery@gmail.com', businessType: 'grocery_kade' },
  { email: 'bizmanager-test-multivendor@gmail.com', businessType: 'multi_vendor' },
  { email: 'bizmanager-test-cosmetic@gmail.com', businessType: 'salon_beauty' },
  { email: 'bizmanager-test-textiles@gmail.com', businessType: 'textile_shop' },
  { email: 'bizmanager-test-spareparts@gmail.com', businessType: 'workshop_repair' },
];

function loadEnv() {
  const envPath = join(__dirname, '../supabase/.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

async function seedCategories(admin, companyId, businessType) {
  const expenseTemplates = getExpenseCategoriesForBusinessType(businessType);
  const { data: existingExpense } = await admin
    .from('expense_categories')
    .select('name_en')
    .eq('company_id', companyId);
  const expenseNames = new Set((existingExpense ?? []).map((r) => r.name_en));
  const expenseRows = expenseTemplates
    .filter((c) => !expenseNames.has(c.name_en))
    .map((c) => ({
      company_id: companyId,
      name_en: c.name_en,
      name_si: c.name_si,
      name_ta: c.name_ta,
      icon: c.icon,
      color: c.color,
      is_default: true,
      is_hidden: false,
    }));
  if (expenseRows.length) {
    const { error } = await admin.from('expense_categories').insert(expenseRows);
    if (error) throw error;
  }

  const incomeTemplates = getIncomeCategoriesForBusinessType(businessType);
  const { data: existingIncome } = await admin
    .from('income_categories')
    .select('name_en')
    .eq('company_id', companyId);
  const incomeNames = new Set((existingIncome ?? []).map((r) => r.name_en));
  const incomeRows = incomeTemplates
    .filter((c) => !incomeNames.has(c.name_en))
    .map((c) => ({
      company_id: companyId,
      name_en: c.name_en,
      name_si: c.name_si,
      name_ta: c.name_ta,
      icon: c.icon,
      color: c.color,
      is_default: true,
      is_hidden: false,
    }));
  if (incomeRows.length) {
    const { error } = await admin.from('income_categories').insert(incomeRows);
    if (error) throw error;
  }
}

loadEnv();
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

for (const test of TEST_COMPANIES) {
  const { data: profile } = await admin
    .from('profiles')
    .select('company_id, full_name')
    .eq('email', test.email)
    .maybeSingle();

  if (!profile) {
    console.warn(`Skip (no profile): ${test.email}`);
    continue;
  }

  const { data: company } = await admin
    .from('companies')
    .update({ business_type: test.businessType })
    .eq('id', profile.company_id)
    .select('name, business_type')
    .single();

  await seedCategories(admin, profile.company_id, test.businessType);
  console.log(`✅ ${test.email} → ${company?.name} (${test.businessType})`);
}

console.log('\nAll test companies updated. Password: BizTest2026!');
