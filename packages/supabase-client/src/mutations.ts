import type {
  CustomerInput,
  CustomerUpdateInput,
  ExpenseCategoryInput,
  ExpenseInput,
  IncomeInput,
  SettingsInput,
  SupplierInput,
  SupplierUpdateInput,
} from '@bizmanager/types';
import { calculateRiskLevel, requiresOwnerApproval, formatCurrency, buildPaymentMetaFields, MULTI_VENDOR_SETTLEMENT_CATEGORY } from '@bizmanager/utils';
import { getSupabase } from './client';
import { getCurrentProfile } from './auth';
import { getCompany, getAccounts, isDemoMode } from './queries';

export async function getContext() {
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

async function notifyOwners(
  companyId: string,
  type: string,
  title: string,
  body: string,
  relatedType?: string,
  relatedId?: string
) {
  const supabase = getSupabase();
  const { data: owners } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .eq('role', 'owner')
    .eq('is_active', true);

  if (!owners?.length) return;

  await supabase.from('notifications').insert(
    owners.map((o) => ({
      company_id: companyId,
      user_id: o.id,
      type,
      title,
      body,
      related_type: relatedType ?? null,
      related_id: relatedId ?? null,
    }))
  );
}

export async function createIncome(input: IncomeInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const status = input.markAsPaid ? 'approved' : 'pending';
  const paymentMeta = buildPaymentMetaFields(input);

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      company_id: profile.company_id,
      type: 'income',
      category: input.category,
      amount: input.amount,
      payment_method: input.paymentMethod,
      ...paymentMeta,
      account_id: input.accountId || null,
      customer_id: input.customerId || null,
      supplier_id: input.supplierId || null,
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
      ...buildPaymentMetaFields(input),
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

    const { data: pr } = await supabase.from('payment_requests').insert({
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
    }).select('id').single();

    await notifyOwners(
      profile.company_id,
      'approval',
      'Expense needs approval',
      `${input.category} — ${formatCurrency(input.amount)}`,
      'payment_request',
      pr?.id
    );
  } else if (input.accountId) {
    const account = accounts.find((a) => a.id === input.accountId);
    if (account) {
      await supabase
        .from('accounts')
        .update({ current_balance: Number(account.current_balance) - input.amount })
        .eq('id', input.accountId);
    }
    if (
      input.supplierId &&
      input.category === MULTI_VENDOR_SETTLEMENT_CATEGORY
    ) {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('current_balance')
        .eq('id', input.supplierId)
        .single();
      if (supplier) {
        await supabase
          .from('suppliers')
          .update({
            current_balance: Math.max(0, Number(supplier.current_balance) - input.amount),
          })
          .eq('id', input.supplierId);
      }
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
    if (request.transaction_id && request.supplier_id) {
      const { data: tx } = await supabase
        .from('transactions')
        .select('category')
        .eq('id', request.transaction_id)
        .single();
      if (tx?.category === MULTI_VENDOR_SETTLEMENT_CATEGORY) {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('current_balance')
          .eq('id', request.supplier_id)
          .single();
        if (supplier) {
          await supabase
            .from('suppliers')
            .update({
              current_balance: Math.max(0, Number(supplier.current_balance) - Number(request.amount)),
            })
            .eq('id', request.supplier_id);
        }
      }
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

export async function updateCustomer(id: string, input: CustomerUpdateInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();
  if (!existing) throw new Error('Customer not found');

  const { data, error } = await supabase
    .from('customers')
    .update({
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'customer', id, existing, data);
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
      commission_rate: input.commissionRate ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'supplier', data.id);
  return data;
}

export async function updateSupplier(id: string, input: SupplierUpdateInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();
  if (!existing) throw new Error('Supplier not found');

  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      ...(input.commissionRate !== undefined ? { commission_rate: input.commissionRate } : {}),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'supplier', id, existing, data);
  return data;
}

export async function updateCompany(input: SettingsInput) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can update company settings');
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single();
  if (!existing) throw new Error('Company not found');

  const { data, error } = await supabase
    .from('companies')
    .update({
      name: input.name,
      owner_name: input.ownerName || null,
      currency: input.currency,
      default_language: input.defaultLanguage,
      tax_enabled: input.taxEnabled,
      vat_rate: input.vatRate,
      sscl_enabled: input.ssclEnabled,
      sscl_rate: input.ssclRate,
      service_charge_rate: input.serviceChargeRate,
      approval_auto_limit: input.approvalAutoLimit,
      staff_module_enabled: input.staffModuleEnabled,
    })
    .eq('id', profile.company_id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'company', profile.company_id, existing, data);
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

  const { data: pr } = await supabase.from('payment_requests').insert({
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
  }).select('id').single();

  await notifyOwners(
    profile.company_id,
    'payroll',
    'Payroll submitted',
    `${run.month}/${run.year} — ${formatCurrency(run.total_payable)}`,
    'payment_request',
    pr?.id
  );

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

export async function markNotificationRead(notificationId: string) {
  if (isDemoMode()) return;
  const { profile } = await getContext();
  const supabase = getSupabase();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', profile.id);
}

export async function markAllNotificationsRead() {
  if (isDemoMode()) return;
  const { profile } = await getContext();
  const supabase = getSupabase();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profile.id)
    .eq('is_read', false);
}

export async function createExpenseCategory(input: ExpenseCategoryInput) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can manage expense categories');
  const supabase = getSupabase();
  const name = input.name_en.trim();

  const { data: duplicate } = await supabase
    .from('expense_categories')
    .select('id')
    .eq('company_id', profile.company_id)
    .eq('name_en', name)
    .maybeSingle();
  if (duplicate) throw new Error('A category with this name already exists');

  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      company_id: profile.company_id,
      name_en: name,
      icon: 'tag',
      color: '#64748B',
      is_default: false,
      is_hidden: false,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'expense_category', data.id, undefined, data);
  return data;
}

export async function updateExpenseCategory(id: string, input: ExpenseCategoryInput) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can manage expense categories');
  const supabase = getSupabase();
  const name = input.name_en.trim();

  const { data: existing, error: fetchErr } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();
  if (fetchErr || !existing) throw new Error('Category not found');

  if (name !== existing.name_en) {
    const { data: duplicate } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('name_en', name)
      .neq('id', id)
      .maybeSingle();
    if (duplicate) throw new Error('A category with this name already exists');

    await supabase
      .from('transactions')
      .update({ category: name })
      .eq('company_id', profile.company_id)
      .eq('category', existing.name_en);
  }

  const { data, error } = await supabase
    .from('expense_categories')
    .update({ name_en: name })
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'expense_category', id, existing, data);
  return data;
}

export async function setExpenseCategoryHidden(id: string, hidden: boolean) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can manage expense categories');
  const supabase = getSupabase();

  const { data: existing, error: fetchErr } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();
  if (fetchErr || !existing) throw new Error('Category not found');

  const { data, error } = await supabase
    .from('expense_categories')
    .update({ is_hidden: hidden })
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(
    profile.company_id,
    profile.id,
    hidden ? 'hide' : 'show',
    'expense_category',
    id,
    existing,
    data
  );
  return data;
}

export async function createIncomeCategory(input: ExpenseCategoryInput) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can manage income categories');
  const supabase = getSupabase();
  const name = input.name_en.trim();

  const { data: duplicate } = await supabase
    .from('income_categories')
    .select('id')
    .eq('company_id', profile.company_id)
    .eq('name_en', name)
    .maybeSingle();
  if (duplicate) throw new Error('A category with this name already exists');

  const { data, error } = await supabase
    .from('income_categories')
    .insert({
      company_id: profile.company_id,
      name_en: name,
      icon: 'tag',
      color: '#16A34A',
      is_default: false,
      is_hidden: false,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'income_category', data.id, undefined, data);
  return data;
}

export async function updateIncomeCategory(id: string, input: ExpenseCategoryInput) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can manage income categories');
  const supabase = getSupabase();
  const name = input.name_en.trim();

  const { data: existing, error: fetchErr } = await supabase
    .from('income_categories')
    .select('*')
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();
  if (fetchErr || !existing) throw new Error('Category not found');

  if (name !== existing.name_en) {
    const { data: duplicate } = await supabase
      .from('income_categories')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('name_en', name)
      .neq('id', id)
      .maybeSingle();
    if (duplicate) throw new Error('A category with this name already exists');

    await supabase
      .from('transactions')
      .update({ category: name })
      .eq('company_id', profile.company_id)
      .eq('type', 'income')
      .eq('category', existing.name_en);
  }

  const { data, error } = await supabase
    .from('income_categories')
    .update({ name_en: name })
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'income_category', id, existing, data);
  return data;
}

export async function setIncomeCategoryHidden(id: string, hidden: boolean) {
  const { profile } = await getContext();
  if (profile.role !== 'owner') throw new Error('Only owner can manage income categories');
  const supabase = getSupabase();

  const { data: existing, error: fetchErr } = await supabase
    .from('income_categories')
    .select('*')
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();
  if (fetchErr || !existing) throw new Error('Category not found');

  const { data, error } = await supabase
    .from('income_categories')
    .update({ is_hidden: hidden })
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(
    profile.company_id,
    profile.id,
    hidden ? 'hide' : 'show',
    'income_category',
    id,
    existing,
    data
  );
  return data;
}

export async function updateChequeStatus(
  transactionId: string,
  status: 'cleared' | 'bounced' | 'cancelled'
) {
  const { profile } = await getContext();
  if (profile.role !== 'owner' && profile.role !== 'manager') {
    throw new Error('Not allowed to update cheque status');
  }
  const supabase = getSupabase();

  const { data: existing, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('company_id', profile.company_id)
    .single();
  if (fetchErr || !existing) throw new Error('Transaction not found');
  if (existing.payment_method !== 'cheque') throw new Error('Not a cheque payment');

  const { data, error } = await supabase
    .from('transactions')
    .update({
      cheque_status: status,
      cheque_cleared_at: status === 'cleared' ? new Date().toISOString() : null,
    })
    .eq('id', transactionId)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'transaction', transactionId, existing, data);
  return data;
}

export async function savePushToken(expoPushToken: string, platform?: string) {
  const { profile } = await getContext();
  const supabase = getSupabase();

  const { error } = await supabase.from('device_push_tokens').upsert(
    {
      profile_id: profile.id,
      company_id: profile.company_id,
      expo_push_token: expoPushToken,
      platform: platform ?? null,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,expo_push_token' }
  );
  if (error) throw error;
}
