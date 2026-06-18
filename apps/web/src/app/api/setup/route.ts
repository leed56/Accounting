import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { companySetupSchema, type BusinessType } from '@bizmanager/types';
import { getExpenseCategoriesForBusinessType } from '@bizmanager/utils';

async function seedExpenseCategories(
  admin: SupabaseClient,
  companyId: string,
  businessType: BusinessType
) {  const templates = getExpenseCategoriesForBusinessType(businessType);
  const { data: existing } = await admin
    .from('expense_categories')
    .select('name_en')
    .eq('company_id', companyId);
  const existingNames = new Set((existing ?? []).map((r: { name_en: string }) => r.name_en));
  const toInsert = templates
    .filter((c) => !existingNames.has(c.name_en))
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
  if (toInsert.length === 0) return;
  const { error } = await admin.from('expense_categories').insert(toInsert);
  if (error) throw error;
}

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!serviceKey || !supabaseUrl || !anonKey) {
    return NextResponse.json(
      { error: 'Setup not configured. Add SUPABASE_SERVICE_ROLE_KEY on the server.' },
      { status: 503 }
    );
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user?.email) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const parsed = companySetupSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, company_id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      {
        error: 'You already have a company linked to this account. Open Settings to update your business profile.',
        companyId: existingProfile.company_id,
      },
      { status: 409 }
    );
  }

  const setup = parsed.data;

  const { data: company, error: companyErr } = await admin
    .from('companies')
    .insert({
      name: setup.businessName,
      business_type: setup.businessType,
      currency: setup.currency,
      owner_name: setup.ownerName,
      default_language: setup.language,
      staff_module_enabled: setup.staffModuleEnabled,
      tax_enabled: setup.taxEnabled,
    })
    .select('id')
    .single();

  if (companyErr || !company) {
    return NextResponse.json(
      { error: companyErr?.message ?? 'Could not create company' },
      { status: 400 }
    );
  }

  const { error: profileErr } = await admin.from('profiles').insert({
    auth_user_id: user.id,
    company_id: company.id,
    full_name: setup.ownerName,
    email: user.email,
    role: 'owner',
    language: setup.language,
  });

  if (profileErr) {
    await admin.from('companies').delete().eq('id', company.id);
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  const { error: accountsErr } = await admin.from('accounts').insert([
    { company_id: company.id, name: 'Cash', type: 'cash', current_balance: 0, is_default: true },
    { company_id: company.id, name: 'Bank', type: 'bank', current_balance: 0, is_default: true },
  ]);

  if (accountsErr) {
    return NextResponse.json({ error: accountsErr.message }, { status: 400 });
  }

  try {
    await seedExpenseCategories(admin, company.id, setup.businessType);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not seed categories' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, companyId: company.id });
}
