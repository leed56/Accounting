/**
 * Link an auth user to Royal Travels company as owner (run once after signup)
 * Usage: node scripts/link-owner.mjs your@email.com "Your Name"
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '../supabase/.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const email = process.argv[2] || 'appleview778@gmail.com';
const fullName = process.argv[3] || 'Kasun Perera';
const COMPANY_ID = '00000000-0000-4000-8000-000000000001';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) {
  console.error('Auth list error:', listErr.message);
  process.exit(1);
}

let user = users.users.find((u) => u.email === email);

if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'BizManager2026!',
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error('Create user error:', error.message);
    process.exit(1);
  }
  user = data.user;
  console.log('Created auth user:', email, '(temp password: BizManager2026!)');
}

const { data: existing } = await supabase
  .from('profiles')
  .select('id')
  .eq('auth_user_id', user.id)
  .maybeSingle();

if (existing) {
  console.log('Profile already linked for', email);
  process.exit(0);
}

const { error: profileErr } = await supabase.from('profiles').insert({
  auth_user_id: user.id,
  company_id: COMPANY_ID,
  full_name: fullName,
  email,
  role: 'owner',
  language: 'en',
});

if (profileErr) {
  console.error('Profile error:', profileErr.message);
  process.exit(1);
}

console.log('Linked', email, 'as owner of Royal Travels Office');
