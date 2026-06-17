import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { inviteSchema } from '@bizmanager/types';

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!serviceKey || !supabaseUrl || !anonKey) {
    return NextResponse.json(
      { error: 'Invite not configured. Add SUPABASE_SERVICE_ROLE_KEY to server env.' },
      { status: 503 }
    );
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = inviteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: profile } = await admin
    .from('profiles')
    .select('id, company_id, role')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return NextResponse.json({ error: 'Only owner can invite team members' }, { status: 403 });
  }

  const { email, fullName, role } = parsed.data;

  const { data: members } = await admin
    .from('profiles')
    .select('id')
    .eq('company_id', profile.company_id)
    .eq('is_active', true);

  if ((members?.length ?? 0) >= 3) {
    return NextResponse.json({ error: 'Small Office plan allows up to 3 users' }, { status: 400 });
  }

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ error: 'User already has a profile' }, { status: 400 });
  }

  const tempPassword = `Biz${Math.random().toString(36).slice(2, 10)}!`;
  const { data: listData } = await admin.auth.admin.listUsers();
  let authUser = listData?.users.find((u) => u.email === email);
  let createdPassword: string | undefined;

  if (!authUser) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }
    authUser = created.user;
    createdPassword = tempPassword;
  }

  const { error: profileErr } = await admin.from('profiles').insert({
    auth_user_id: authUser!.id,
    company_id: profile.company_id,
    full_name: fullName,
    email,
    role,
    language: 'en',
  });

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    tempPassword: createdPassword,
    message: createdPassword
      ? 'Account created. Share the temporary password with the team member.'
      : 'Existing auth user linked to your company.',
  });
}
