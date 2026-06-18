/**
 * Admin: create auth user + company + owner profile in one step
 *
 * Usage:
 *   pnpm admin:create-company email@example.com "Owner Name" "Business Name" tuition_education
 *   pnpm admin:create-company email@example.com "Owner Name" "Business Name" retail_shop MyPass123!
 *
 * Requires supabase/.env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BUSINESS_TYPES } from '../packages/types/src/enums.ts';
import { getExpenseCategoriesForBusinessType } from '../packages/utils/src/category.ts';
import { getIncomeCategoriesForBusinessType } from '../packages/utils/src/income-category.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APP_LOGIN_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://accounting-one-fawn.vercel.app';

function loadEnv() {
  try {
    const envPath = join(__dirname, '../supabase/.env.local');
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    console.error('Missing supabase/.env.local — add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
BizManager — admin create company

Usage:
  pnpm admin:create-company <email> "<owner name>" "<business name>" <business_type> [temp_password] [language]

Arguments:
  email           Login email for the owner
  owner name      Full name shown in app
  business name   Company name
  business_type   One of: ${BUSINESS_TYPES.join(', ')}
  temp_password   Optional (default: random BizXXXXXXXX!)
  language        Optional: en | si | ta (default: en)

Example:
  pnpm admin:create-company kasun@gmail.com "Kasun Perera" "Shakthi Maths Academy" tuition_education
`);
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

const email = process.argv[2]?.trim().toLowerCase();
const ownerName = process.argv[3];
const businessName = process.argv[4];
const businessType = process.argv[5];
const tempPasswordArg = process.argv[6];
const languageArg = process.argv[7] ?? 'en';

if (!email || !ownerName || !businessName || !businessType || process.argv.includes('--help')) {
  printHelp();
  process.exit(email ? 0 : 1);
}

if (!BUSINESS_TYPES.includes(businessType)) {
  console.error(`Invalid business_type: ${businessType}`);
  console.error('Valid types:', BUSINESS_TYPES.join(', '));
  process.exit(1);
}

if (!['en', 'si', 'ta'].includes(languageArg)) {
  console.error('language must be en, si, or ta');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in supabase/.env.local');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  console.error('Auth list error:', listErr.message);
  process.exit(1);
}

let authUser = listData.users.find((u) => u.email?.toLowerCase() === email);
let tempPassword = tempPasswordArg;
let userCreated = false;

if (!authUser) {
  tempPassword = tempPassword ?? `Biz${Math.random().toString(36).slice(2, 10)}!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: ownerName },
  });
  if (error) {
    console.error('Create user error:', error.message);
    process.exit(1);
  }
  authUser = data.user;
  userCreated = true;
}

const { data: existingProfile } = await admin
  .from('profiles')
  .select('id, company_id')
  .eq('auth_user_id', authUser.id)
  .maybeSingle();

if (existingProfile) {
  console.error(`User ${email} already has a company (id: ${existingProfile.company_id}).`);
  console.error('Use Settings → Invite for additional users, or use a new email.');
  process.exit(1);
}

const { data: company, error: companyErr } = await admin
  .from('companies')
  .insert({
    name: businessName,
    business_type: businessType,
    currency: 'LKR',
    owner_name: ownerName,
    default_language: languageArg,
    staff_module_enabled: true,
    tax_enabled: false,
  })
  .select('id')
  .single();

if (companyErr || !company) {
  console.error('Company error:', companyErr?.message ?? 'unknown');
  process.exit(1);
}

const { error: profileErr } = await admin.from('profiles').insert({
  auth_user_id: authUser.id,
  company_id: company.id,
  full_name: ownerName,
  email,
  role: 'owner',
  language: languageArg,
});

if (profileErr) {
  await admin.from('companies').delete().eq('id', company.id);
  console.error('Profile error:', profileErr.message);
  process.exit(1);
}

const { error: accountsErr } = await admin.from('accounts').insert([
  { company_id: company.id, name: 'Cash', type: 'cash', current_balance: 0, is_default: true },
  { company_id: company.id, name: 'Bank', type: 'bank', current_balance: 0, is_default: true },
]);

if (accountsErr) {
  console.error('Accounts error:', accountsErr.message);
  process.exit(1);
}

try {
  await seedCategories(admin, company.id, businessType);
} catch (e) {
  console.error('Category seed error:', e instanceof Error ? e.message : e);
  process.exit(1);
}

console.log('\n✅ Company created successfully\n');
console.log('Company:', businessName);
console.log('Company ID:', company.id);
console.log('Business type:', businessType);
console.log('Owner:', ownerName);
console.log('Email:', email);
if (userCreated) {
  console.log('Temporary password:', tempPassword);
} else if (tempPasswordArg) {
  const { error: pwErr } = await admin.auth.admin.updateUserById(authUser.id, {
    password: tempPasswordArg,
  });
  if (pwErr) {
    console.warn('Could not update password:', pwErr.message);
  } else {
    console.log('Password updated to:', tempPasswordArg);
  }
} else {
  console.log('Auth user already existed — use their existing password or reset in Supabase.');
}
console.log('\nLogin URL:', `${APP_LOGIN_URL}/login`);
console.log('\nShare with customer: email + password above. They can reset password via Supabase if needed.\n');
