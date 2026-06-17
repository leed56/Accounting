/**
 * Seed Royal Travels Office sample data (service role — server only)
 * Usage: node scripts/seed-demo.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const COMPANY_ID = '00000000-0000-4000-8000-000000000001';

async function seed() {
  const { error: companyErr } = await supabase.from('companies').upsert({
    id: COMPANY_ID,
    name: 'Royal Travels Office',
    business_type: 'travel_agency',
    currency: 'LKR',
    default_language: 'en',
    owner_name: 'Kasun Perera',
    staff_module_enabled: true,
    approval_auto_limit: 5000,
  });
  if (companyErr && !companyErr.message.includes('duplicate')) {
    console.error('Company:', companyErr.message);
    process.exit(1);
  }

  const accounts = [
    { company_id: COMPANY_ID, name: 'Cash', type: 'cash', current_balance: 95430, is_default: true },
    { company_id: COMPANY_ID, name: 'Bank', type: 'bank', current_balance: 420680, is_default: true },
  ];
  for (const a of accounts) {
    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('company_id', COMPANY_ID)
      .eq('name', a.name)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from('accounts').insert(a);
    if (error) console.warn('Account:', error.message);
  }

  const staff = [
    { company_id: COMPANY_ID, full_name: 'Kasun Perera', role_title: 'Owner', basic_salary: 150000, email: 'kasun@royaltravels.lk' },
    { company_id: COMPANY_ID, full_name: 'Nimal Perera', role_title: 'Manager', basic_salary: 85000 },
    { company_id: COMPANY_ID, full_name: 'Kavindi Silva', role_title: 'Assistant', basic_salary: 45000 },
    { company_id: COMPANY_ID, full_name: 'Saman Jayasuriya', role_title: 'Driver', basic_salary: 55000 },
  ];
  const { error: staffErr } = await supabase.from('staff').insert(staff);
  if (staffErr && !staffErr.message.includes('duplicate')) console.warn('Staff:', staffErr.message);

  const categories = [
    { company_id: COMPANY_ID, name_en: 'Rent', name_si: 'කුලී', name_ta: 'கட்டணம்', icon: 'home', color: '#3B82F6', is_default: true },
    { company_id: COMPANY_ID, name_en: 'Fuel', name_si: 'ඉන්ධන', name_ta: 'எரிபொருள்', icon: 'fuel', color: '#F59E0B', is_default: true },
    { company_id: COMPANY_ID, name_en: 'Internet', name_si: 'අන්තර්ජාල', name_ta: 'இணையம்', icon: 'wifi', color: '#06B6D4', is_default: true },
  ];
  const { error: catErr } = await supabase.from('expense_categories').insert(categories);
  if (catErr && !catErr.message.includes('duplicate')) console.warn('Categories:', catErr.message);

  const customers = [
    { company_id: COMPANY_ID, name: 'ABC Traders', current_balance: 45000 },
    { company_id: COMPANY_ID, name: 'Sunshine Holdings', current_balance: 75000 },
    { company_id: COMPANY_ID, name: 'Nimal Enterprises', current_balance: 25000 },
    { company_id: COMPANY_ID, name: 'Blue Sky Travels', current_balance: 30000 },
    { company_id: COMPANY_ID, name: 'Walkers Tours', current_balance: 10000 },
  ];
  const { error: custErr } = await supabase.from('customers').insert(customers);
  if (custErr && !custErr.message.includes('duplicate')) console.warn('Customers:', custErr.message);

  const suppliers = [
    { company_id: COMPANY_ID, name: 'Dialog', current_balance: 8500 },
    { company_id: COMPANY_ID, name: 'Ceypetco/Fuel Vendor', current_balance: 12750 },
    { company_id: COMPANY_ID, name: 'Office Rent Owner', current_balance: 75000 },
    { company_id: COMPANY_ID, name: 'Global Traders', current_balance: 15000 },
    { company_id: COMPANY_ID, name: 'Stationery Supplier', current_balance: 5750 },
  ];
  const { error: supErr } = await supabase.from('suppliers').insert(suppliers);
  if (supErr && !supErr.message.includes('duplicate')) console.warn('Suppliers:', supErr.message);

  console.log('Seed complete for Royal Travels Office (company id:', COMPANY_ID, ')');
  console.log('Link your auth user via profiles table after signup.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
