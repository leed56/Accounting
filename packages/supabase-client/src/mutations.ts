import type { CustomerInput, ExpenseInput, IncomeInput, SupplierInput } from '@bizmanager/types';
import { calculateRiskLevel, requiresOwnerApproval } from '@bizmanager/utils';
import { getSupabase } from './client';
import { getCurrentProfile } from './auth';
import { getCompany, getAccounts } from './queries';

async function getContext() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');
  const company = await getCompany(profile.company_id);
  return { profile, company };
}

export async function createAuditLog(
  companyId: string,
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>
) {
  const supabase = getSupabase();
  await supabase.from('audit_logs').insert({
    company_id: companyId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
  });
}

export async function createIncome(input: IncomeInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const status = input.markAsPaid ? 'approved' : 'pending';

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      company_id: profile.company_id,
      type: 'income',
      category: 'Income',
      amount: input.amount,
      payment_method: input.paymentMethod,
      account_id: input.accountId || null,
      customer_id: input.customerId || null,
      description: input.notes || null,
      transaction_date: input.transactionDate,
      status,
      requires_approval: false,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) throw error;

  if (status === 'approved' && input.accountId) {
    const accounts = await getAccounts(profile.company_id);
    const account = accounts.find((a) => a.id === input.accountId);
    if (account) {
      await supabase
        .from('accounts')
        .update({ current_balance: Number(account.current_balance) + input.amount })
        .eq('id', input.accountId);
    }
  }

  if (input.customerId && input.markAsPaid) {
    const { data: customer } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('id', input.customerId)
      .single();
    if (customer) {
      await supabase
        .from('customers')
        .update({
          current_balance: Math.max(0, Number(customer.current_balance) - input.amount),
        })
        .eq('id', input.customerId);
    }
  }

  await createAuditLog(profile.company_id, profile.id, 'create', 'transaction', data.id, undefined, {
    type: 'income',
    amount: input.amount,
  });

  return data;
}

export async function createExpense(input: ExpenseInput) {
  const { profile, company } = await getContext();
  const supabase = getSupabase();
  const autoLimit = company?.approval_auto_limit ?? 5000;
  const needsApproval =
    input.requiresApproval || requiresOwnerApproval(input.amount, autoLimit, 'expense');
  const status = needsApproval ? 'pending' : 'approved';

  const accounts = await getAccounts(profile.company_id);
  const cashBalance = accounts.find((a) => a.type === 'cash')?.current_balance ?? 0;
  const riskLevel = calculateRiskLevel(input.amount, autoLimit, Number(cashBalance));

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert({
      company_id: profile.company_id,
      type: 'expense',
      category: input.category,
      amount: input.amount,
      payment_method: input.paymentMethod,
      account_id: input.accountId || null,
      supplier_id: input.supplierId || null,
      description: input.notes || null,
      transaction_date: input.transactionDate,
      status,
      requires_approval: needsApproval,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) throw error;

  if (needsApproval) {
    const { data: supplier } = input.supplierId
      ? await supabase.from('suppliers').select('name').eq('id', input.supplierId).single()
      : { data: null };

    await supabase.from('payment_requests').insert({
      company_id: profile.company_id,
      request_type: 'expense',
      amount: input.amount,
      category: input.category,
      payee_name: supplier?.name ?? input.category,
      supplier_id: input.supplierId || null,
      transaction_id: tx.id,
      description: input.notes || `Expense: ${input.category}`,
      payment_method: input.paymentMethod,
      risk_level: riskLevel,
      ai_note:
        riskLevel === 'high'
          ? 'This payment may exceed your cash balance.'
          : 'This expense requires owner approval.',
      status: 'pending',
      requested_by: profile.id,
    });
  } else if (input.accountId) {
    const account = accounts.find((a) => a.id === input.accountId);
    if (account) {
      await supabase
        .from('accounts')
        .update({ current_balance: Number(account.current_balance) - input.amount })
        .eq('id', input.accountId);
    }
  }

  await createAuditLog(profile.company_id, profile.id, 'create', 'transaction', tx.id, undefined, {
    type: 'expense',
    amount: input.amount,
    status,
  });

  return { transaction: tx, needsApproval };
}

export async function processApproval(
  requestId: string,
  action: 'approve' | 'reject',
  comment?: string
) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can approve payments');

  const supabase = getSupabase();
  const { data: request, error: fetchErr } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchErr || !request) throw new Error('Payment request not found');

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const now = new Date().toISOString();

  await supabase
    .from('payment_requests')
    .update({
      status: newStatus,
      approved_by: profile.id,
      approved_at: now,
      rejected_reason: action === 'reject' ? comment ?? 'Rejected' : null,
    })
    .eq('id', requestId);

  if (request.transaction_id) {
    await supabase
      .from('transactions')
      .update({
        status: newStatus,
        approved_by: profile.id,
        approved_at: now,
      })
      .eq('id', request.transaction_id);
  }

  if (action === 'approve') {
    const accounts = await getAccounts(profile.company_id);
    const cashAccount = accounts.find((a) => a.type === 'cash');
    if (cashAccount) {
      await supabase
        .from('accounts')
        .update({
          current_balance: Number(cashAccount.current_balance) - Number(request.amount),
        })
        .eq('id', cashAccount.id);
    }
  }

  await createAuditLog(
    profile.company_id,
    profile.id,
    action,
    'payment_request',
    requestId,
    { status: request.status },
    { status: newStatus, comment }
  );

  return { status: newStatus };
}

export async function updateLeaveStatus(
  leaveId: string,
  action: 'approve' | 'reject'
) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can approve leave');

  const supabase = getSupabase();
  const status = action === 'approve' ? 'approved' : 'rejected';
  const { error } = await supabase
    .from('leave_requests')
    .update({
      status,
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', leaveId);

  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, action, 'leave_request', leaveId);
  return { status };
}

export async function saveAttendanceRecords(
  companyId: string,
  date: string,
  records: { staffId: string; status: string; notes?: string | null }[]
) {
  const { profile } = await getContext();
  const supabase = getSupabase();

  for (const record of records) {
    const { error } = await supabase.from('attendance').upsert(
      {
        company_id: companyId,
        staff_id: record.staffId,
        date,
        status: record.status,
        notes: record.notes ?? null,
        marked_by: profile.id,
      },
      { onConflict: 'company_id,staff_id,date' }
    );
    if (error) throw error;
  }

  await createAuditLog(profile.company_id, profile.id, 'save', 'attendance', null, undefined, {
    date,
    count: records.length,
  });
}

export async function createCustomer(input: CustomerInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('customers')
    .insert({
      company_id: profile.company_id,
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      opening_balance: input.openingBalance ?? 0,
      current_balance: input.openingBalance ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'customer', data.id);
  return data;
}

export async function createSupplier(input: SupplierInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      company_id: profile.company_id,
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      opening_balance: input.openingBalance ?? 0,
      current_balance: input.openingBalance ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'supplier', data.id);
  return data;
}

export async function uploadReceipt(
  file: File,
  relatedType: string,
  relatedId: string
) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${profile.company_id}/${relatedType}/${relatedId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(path);

  const { data, error } = await supabase
    .from('attachments')
    .insert({
      company_id: profile.company_id,
      related_type: relatedType,
      related_id: relatedId,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      uploaded_by: profile.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

const EPF_EMPLOYEE_RATE = 0.08;

export async function generatePayrollRun(month?: number, year?: number) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const { data: existing } = await supabase
    .from('payroll_runs')
    .select('id, status')
    .eq('company_id', profile.company_id)
    .eq('month', m)
    .eq('year', y)
    .maybeSingle();

  if (existing && existing.status !== 'draft') {
    throw new Error('Payroll for this month already exists');
  }

  const { data: staffList, error: staffErr } = await supabase
    .from('staff')
    .select('*')
    .eq('company_id', profile.company_id)
    .eq('is_active', true);

  if (staffErr) throw staffErr;
  if (!staffList?.length) throw new Error('No active staff');

  let totalBasic = 0;
  let totalDeductions = 0;
  let totalPayable = 0;

  const items = staffList.map((s) => {
    const basic = Number(s.basic_salary);
    const epfEmployee = basic * EPF_EMPLOYEE_RATE;
    const net = basic - epfEmployee;
    totalBasic += basic;
    totalDeductions += epfEmployee;
    totalPayable += net;
    return {
      staff_id: s.id,
      basic_salary: basic,
      allowance: 0,
      overtime: 0,
      advance: 0,
      deductions: 0,
      no_pay_deduction: 0,
      epf_employee: epfEmployee,
      epf_employer: basic * 0.12,
      etf_employer: basic * 0.03,
      apit: 0,
      net_payable: net,
      status: 'pending',
    };
  });

  let runId = existing?.id;

  if (runId) {
    await supabase.from('payroll_items').delete().eq('payroll_run_id', runId);
    await supabase
      .from('payroll_runs')
      .update({
        total_basic: totalBasic,
        total_advances: 0,
        total_deductions: totalDeductions,
        total_payable: totalPayable,
        status: 'draft',
      })
      .eq('id', runId);
  } else {
    const { data: run, error: runErr } = await supabase
      .from('payroll_runs')
      .insert({
        company_id: profile.company_id,
        month: m,
        year: y,
        total_basic: totalBasic,
        total_advances: 0,
        total_deductions: totalDeductions,
        total_payable: totalPayable,
        status: 'draft',
      })
      .select()
      .single();
    if (runErr) throw runErr;
    runId = run.id;
  }

  const { error: itemsErr } = await supabase.from('payroll_items').insert(
    items.map((item) => ({ ...item, payroll_run_id: runId }))
  );
  if (itemsErr) throw itemsErr;

  await createAuditLog(profile.company_id, profile.id, 'generate', 'payroll_run', runId);
  return { runId, totalPayable };
}

export async function submitPayrollRun(runId: string) {
  const { profile } = await getContext();
  const supabase = getSupabase();

  const { data: run, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .single();
  if (error || !run) throw new Error('Payroll run not found');

  await supabase
    .from('payroll_runs')
    .update({ status: 'submitted', submitted_by: profile.id })
    .eq('id', runId);

  await supabase.from('payment_requests').insert({
    company_id: profile.company_id,
    request_type: 'salary',
    amount: run.total_payable,
    category: 'Payroll',
    payee_name: 'Staff Salaries',
    payroll_run_id: runId,
    description: `Payroll ${run.month}/${run.year}`,
    payment_method: 'bank_transfer',
    risk_level: 'medium',
    ai_note: 'Monthly payroll requires owner approval.',
    status: 'pending',
    requested_by: profile.id,
  });

  await createAuditLog(profile.company_id, profile.id, 'submit', 'payroll_run', runId);
}

export async function approvePayrollRun(runId: string) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can approve payroll');

  const supabase = getSupabase();
  const now = new Date().toISOString();

  await supabase
    .from('payroll_runs')
    .update({ status: 'approved', approved_by: profile.id, approved_at: now })
    .eq('id', runId);

  await supabase
    .from('payment_requests')
    .update({ status: 'approved', approved_by: profile.id, approved_at: now })
    .eq('payroll_run_id', runId);

  await createAuditLog(profile.company_id, profile.id, 'approve', 'payroll_run', runId);
}

export async function markPayrollPaid(runId: string) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can mark payroll paid');

  const supabase = getSupabase();
  await supabase.from('payroll_runs').update({ status: 'paid' }).eq('id', runId);
  await supabase
    .from('payment_requests')
    .update({ status: 'paid' })
    .eq('payroll_run_id', runId);

  await createAuditLog(profile.company_id, profile.id, 'paid', 'payroll_run', runId);
}
