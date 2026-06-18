import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BUSINESS_TYPES } from '@bizmanager/types';
import { getExpenseCategoriesForBusinessType, getIncomeCategoriesForBusinessType } from '@bizmanager/utils';
import { isSuperAdminEmail } from '@/lib/admin';

const adminCreateSchema = z.object({
  email: z.string().email(),
  ownerName: z.string().min(2),
  businessName: z.string().min(2),
  businessType: z.enum(BUSINESS_TYPES),
  tempPassword: z.string().min(6).optional(),
  language: z.enum(['en', 'si', 'ta']).default('en'),
});

async function seedCategories(admin: SupabaseClient, companyId: string, businessType: string) {
  const expenseTemplates = getExpenseCategoriesForBusinessType(businessType as (typeof BUSINESS_TYPES)[number]);
  const { data: existingExpense } = await admin.from('expense_categories').select('name_en').eq('company_id', companyId);
  const expenseNames = new Set((existingExpense ?? []).map((r: { name_en: string }) => r.name_en));
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

  const incomeTemplates = getIncomeCategoriesForBusinessType(businessType as (typeof BUSINESS_TYPES)[number]);
  const { data: existingIncome } = await admin.from('income_categories').select('name_en').eq('company_id', companyId);
  const incomeNames = new Set((existingIncome ?? []).map((r: { name_en: string }) => r.name_en));
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

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!serviceKey || !supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 });
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = adminCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, ownerName, businessName, businessType, tempPassword: tempPasswordArg, language } = parsed.data;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  let authUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
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
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    authUser = data.user;
    userCreated = true;
  }

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, company_id')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ error: 'User already has a company' }, { status: 409 });
  }

  const { data: company, error: companyErr } = await admin
    .from('companies')
    .insert({
      name: businessName,
      business_type: businessType,
      currency: 'LKR',
      owner_name: ownerName,
      default_language: language,
      staff_module_enabled: true,
      tax_enabled: false,
    })
    .select('id')
    .single();

  if (companyErr || !company) {
    return NextResponse.json({ error: companyErr?.message ?? 'Company error' }, { status: 400 });
  }

  const { error: profileErr } = await admin.from('profiles').insert({
    auth_user_id: authUser.id,
    company_id: company.id,
    full_name: ownerName,
    email,
    role: 'owner',
    language,
  });

  if (profileErr) {
    await admin.from('companies').delete().eq('id', company.id);
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  await admin.from('accounts').insert([
    { company_id: company.id, name: 'Cash', type: 'cash', current_balance: 0, is_default: true },
    { company_id: company.id, name: 'Bank', type: 'bank', current_balance: 0, is_default: true },
  ]);

  try {
    await seedCategories(admin, company.id, businessType);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Category seed failed' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    companyId: company.id,
    email,
    tempPassword: userCreated ? tempPassword : tempPasswordArg,
    userCreated,
  });
}
