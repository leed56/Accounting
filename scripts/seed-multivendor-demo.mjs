/**
 * Seed demo data for multi-vendor test company
 * Usage: npx tsx scripts/seed-multivendor-demo.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_EMAIL = 'bizmanager-test-multivendor@gmail.com';

function loadEnv() {
  try {
    const envPath = join(__dirname, '../supabase/.env.local');
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
}

function toISODate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

loadEnv();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in supabase/.env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureAccount(companyId, name, type, balance) {
  const { data: existing } = await supabase
    .from('accounts')
    .select('id, current_balance')
    .eq('company_id', companyId)
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    await supabase.from('accounts').update({ current_balance: balance }).eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      company_id: companyId,
      name,
      type,
      current_balance: balance,
      is_default: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertVendor(companyId, vendor) {
  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .eq('company_id', companyId)
    .eq('name', vendor.name)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('suppliers')
      .update({ current_balance: vendor.current_balance, phone: vendor.phone })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert({ company_id: companyId, ...vendor })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertCustomer(companyId, customer) {
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('company_id', companyId)
    .eq('name', customer.name)
    .maybeSingle();

  if (existing) {
    await supabase.from('customers').update({ current_balance: customer.current_balance }).eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({ company_id: companyId, ...customer })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function seed() {
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, company_id, full_name')
    .eq('email', TEST_EMAIL)
    .maybeSingle();

  if (profileErr || !profile) {
    console.error('Profile not found for', TEST_EMAIL);
    process.exit(1);
  }

  const companyId = profile.company_id;
  const createdBy = profile.id;
  const today = toISODate();
  const monthStart = `${today.slice(0, 8)}01`;

  console.log(`Seeding multi-vendor demo for company ${companyId} (${TEST_EMAIL})`);

  const cashAccountId = await ensureAccount(companyId, 'Cash', 'cash', 185000);
  await ensureAccount(companyId, 'Bank', 'bank', 420000);

  const vendorIds = {};
  for (const vendor of [
    { name: 'Lanka Fresh Foods', phone: '+94771234567', current_balance: 45000 },
    { name: 'Ceylon Textiles Hub', phone: '+94772345678', current_balance: 28000 },
    { name: 'Spice Island Traders', phone: '+94773456789', current_balance: 12500 },
  ]) {
    vendorIds[vendor.name] = await upsertVendor(companyId, vendor);
  }

  await upsertCustomer(companyId, { name: 'Metro Retail Outlet', current_balance: 35000 });
  await upsertCustomer(companyId, { name: 'Online Shop Partner', current_balance: 18000 });

  const { data: existingTx } = await supabase
    .from('transactions')
    .select('id')
    .eq('company_id', companyId)
    .limit(1);

  if (existingTx?.length) {
    console.log('Transactions already exist — updating balances only.');
    console.log('Done. Login:', TEST_EMAIL, 'Password: BizTest2026!');
    return;
  }

  const transactions = [
    {
      type: 'income',
      category: 'Vendor Commission',
      amount: 45000,
      transaction_date: monthStart,
      description: 'June commission — Lanka Fresh Foods',
    },
    {
      type: 'income',
      category: 'Vendor Commission',
      amount: 25000,
      transaction_date: `${today.slice(0, 8)}10`,
      description: 'Commission — Ceylon Textiles Hub',
    },
    {
      type: 'income',
      category: 'Vendor Commission',
      amount: 15000,
      transaction_date: `${today.slice(0, 8)}15`,
      description: 'Commission — Spice Island Traders',
    },
    {
      type: 'income',
      category: 'Service Fee',
      amount: 8000,
      transaction_date: `${today.slice(0, 8)}12`,
      description: 'Platform service fee',
    },
    {
      type: 'expense',
      category: 'Vendor Settlements',
      amount: 35000,
      transaction_date: `${today.slice(0, 8)}08`,
      description: 'Settlement to Lanka Fresh Foods',
      supplier_id: vendorIds['Lanka Fresh Foods'],
    },
    {
      type: 'expense',
      category: 'Vendor Settlements',
      amount: 27000,
      transaction_date: `${today.slice(0, 8)}14`,
      description: 'Settlement to Ceylon Textiles Hub',
      supplier_id: vendorIds['Ceylon Textiles Hub'],
    },
    {
      type: 'income',
      category: 'Vendor Commission',
      amount: 12000,
      transaction_date: today,
      description: 'Today commission',
    },
    {
      type: 'expense',
      category: 'Platform Fees',
      amount: 3500,
      transaction_date: today,
      description: 'Payment gateway fee',
    },
  ];

  for (const tx of transactions) {
    const { error } = await supabase.from('transactions').insert({
      company_id: companyId,
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      payment_method: 'bank_transfer',
      account_id: cashAccountId,
      supplier_id: tx.supplier_id ?? null,
      description: tx.description,
      transaction_date: tx.transaction_date,
      status: 'approved',
      requires_approval: false,
      created_by: createdBy,
    });
    if (error) throw error;
  }

  console.log('✅ Multi-vendor demo seeded');
  console.log('   Vendors: 3 | Commission this month: Rs. 97,000 | Settlements: Rs. 62,000');
  console.log('   Login:', TEST_EMAIL, '| Password: BizTest2026!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
