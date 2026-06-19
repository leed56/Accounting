import type {
  Attendance,
  Company,
  Customer,
  DashboardSummary,
  ExpenseCategory,
  IncomeCategory,
  LeaveRequest,
  PaymentRequest,
  PayrollRun,
  PayrollItemWithStaff,
  Profile,
  Notification,
  Staff,
  Supplier,
  Transaction,
  Account,
} from '@bizmanager/types';
import { toISODate, getExpenseCategoriesForBusinessType, getIncomeCategoriesForBusinessType, getPeriodDateRange, MULTI_VENDOR_COMMISSION_CATEGORIES, MULTI_VENDOR_SETTLEMENT_CATEGORY } from '@bizmanager/utils';
import type { BusinessTypeMetrics } from '@bizmanager/types';
import type { BusinessType, PeriodType } from '@bizmanager/types';
import { getSupabase } from './client';

// Sample data for demo when Supabase is not configured
export const SAMPLE_COMPANY_ID = '00000000-0000-4000-8000-000000000001';

const nullPaymentMeta = {
  payment_reference: null,
  cheque_number: null,
  cheque_status: null,
  cheque_cleared_at: null,
} as const;

export const sampleDashboard: DashboardSummary = {
  todayIncome: 125750,
  todayExpenses: 68540,
  netProfit: 57210,
  cashBalance: 95430,
  bankBalance: 420680,
  staffPresent: 3,
  staffTotal: 4,
  pendingApprovals: 3,
  pendingApprovalAmount: 75000,
  pendingLeave: 1,
  receivables: 185000,
  payables: 92000,
};

export const sampleStaff: Staff[] = [
  {
    id: '1',
    company_id: SAMPLE_COMPANY_ID,
    profile_id: null,
    full_name: 'Kasun Perera',
    role_title: 'Owner',
    phone: '+94771234567',
    email: 'kasun@royaltravels.lk',
    basic_salary: 150000,
    salary_type: 'monthly',
    joined_date: '2020-01-15',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    company_id: SAMPLE_COMPANY_ID,
    profile_id: null,
    full_name: 'Nimal Perera',
    role_title: 'Manager',
    phone: '+94772345678',
    email: 'nimal@royaltravels.lk',
    basic_salary: 85000,
    salary_type: 'monthly',
    joined_date: '2021-03-01',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    company_id: SAMPLE_COMPANY_ID,
    profile_id: null,
    full_name: 'Kavindi Silva',
    role_title: 'Assistant',
    phone: '+94773456789',
    email: null,
    basic_salary: 45000,
    salary_type: 'monthly',
    joined_date: '2022-06-10',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    company_id: SAMPLE_COMPANY_ID,
    profile_id: null,
    full_name: 'Saman Jayasuriya',
    role_title: 'Driver',
    phone: '+94774567890',
    email: null,
    basic_salary: 55000,
    salary_type: 'monthly',
    joined_date: '2021-08-20',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const sampleCustomers: Customer[] = [
  { id: '1', company_id: SAMPLE_COMPANY_ID, name: 'ABC Traders', phone: '+94112345678', email: null, address: 'Colombo 03', opening_balance: 0, current_balance: 45000, created_at: new Date().toISOString() },
  { id: '2', company_id: SAMPLE_COMPANY_ID, name: 'Sunshine Holdings', phone: '+94113456789', email: 'info@sunshine.lk', address: 'Kandy', opening_balance: 0, current_balance: 75000, created_at: new Date().toISOString() },
  { id: '3', company_id: SAMPLE_COMPANY_ID, name: 'Nimal Enterprises', phone: null, email: null, address: 'Galle', opening_balance: 0, current_balance: 25000, created_at: new Date().toISOString() },
  { id: '4', company_id: SAMPLE_COMPANY_ID, name: 'Blue Sky Travels', phone: '+94114567890', email: null, address: 'Negombo', opening_balance: 0, current_balance: 30000, created_at: new Date().toISOString() },
  { id: '5', company_id: SAMPLE_COMPANY_ID, name: 'Walkers Tours', phone: '+94115678901', email: 'book@walkers.lk', address: 'Colombo 07', opening_balance: 0, current_balance: 10000, created_at: new Date().toISOString() },
];

export const sampleSuppliers: Supplier[] = [
  { id: '1', company_id: SAMPLE_COMPANY_ID, name: 'Dialog', phone: '1777', email: null, address: null, opening_balance: 0, current_balance: 8500, commission_rate: 0, branch_id: null, created_at: new Date().toISOString() },
  { id: '2', company_id: SAMPLE_COMPANY_ID, name: 'Ceypetco/Fuel Vendor', phone: null, email: null, address: 'Colombo', opening_balance: 0, current_balance: 12750, commission_rate: 0, branch_id: null, created_at: new Date().toISOString() },
  { id: '3', company_id: SAMPLE_COMPANY_ID, name: 'Office Rent Owner', phone: '+94771234567', email: null, address: 'Colombo 05', opening_balance: 0, current_balance: 75000, commission_rate: 0, branch_id: null, created_at: new Date().toISOString() },
  { id: '4', company_id: SAMPLE_COMPANY_ID, name: 'Global Traders', phone: null, email: null, address: null, opening_balance: 0, current_balance: 15000, commission_rate: 0, branch_id: null, created_at: new Date().toISOString() },
  { id: '5', company_id: SAMPLE_COMPANY_ID, name: 'Stationery Supplier', phone: null, email: null, address: null, opening_balance: 0, current_balance: 5750, commission_rate: 0, branch_id: null, created_at: new Date().toISOString() },
];

export const sampleTransactions: Transaction[] = [
  { id: '1', company_id: SAMPLE_COMPANY_ID, type: 'income', category: 'Tour Booking', amount: 85000, payment_method: 'bank_transfer', ...nullPaymentMeta, status: 'approved', account_id: null, customer_id: '1', supplier_id: null, staff_id: null, description: 'Colombo tour package', transaction_date: toISODate(), requires_approval: false, created_by: null, approved_by: null, approved_at: null, created_at: new Date().toISOString() },
  { id: '2', company_id: SAMPLE_COMPANY_ID, type: 'income', category: 'Airport Transfer', amount: 40750, payment_method: 'cash', ...nullPaymentMeta, status: 'approved', account_id: null, customer_id: '2', supplier_id: null, staff_id: null, description: 'Airport pickup', transaction_date: toISODate(), requires_approval: false, created_by: null, approved_by: null, approved_at: null, created_at: new Date().toISOString() },
  { id: '3', company_id: SAMPLE_COMPANY_ID, type: 'expense', category: 'Fuel', amount: 12750, payment_method: 'cash', ...nullPaymentMeta, status: 'approved', account_id: null, customer_id: null, supplier_id: '2', staff_id: null, description: 'Vehicle fuel', transaction_date: toISODate(), requires_approval: false, created_by: null, approved_by: null, approved_at: null, created_at: new Date().toISOString() },
  { id: '4', company_id: SAMPLE_COMPANY_ID, type: 'expense', category: 'Internet', amount: 8500, payment_method: 'bank_transfer', ...nullPaymentMeta, status: 'approved', account_id: null, customer_id: null, supplier_id: '1', staff_id: null, description: 'Monthly internet bill', transaction_date: toISODate(), requires_approval: false, created_by: null, approved_by: null, approved_at: null, created_at: new Date().toISOString() },
  { id: '5', company_id: SAMPLE_COMPANY_ID, type: 'expense', category: 'Rent', amount: 75000, payment_method: 'bank_transfer', ...nullPaymentMeta, status: 'pending', account_id: null, customer_id: null, supplier_id: '3', staff_id: null, description: 'Office rent - June', transaction_date: toISODate(), requires_approval: true, created_by: null, approved_by: null, approved_at: null, created_at: new Date().toISOString() },
];

export const samplePaymentRequests: PaymentRequest[] = [
  { id: '1', company_id: SAMPLE_COMPANY_ID, request_type: 'expense', amount: 75000, category: 'Rent', payee_name: 'Office Rent Owner', supplier_id: '3', staff_id: null, transaction_id: '5', payroll_run_id: null, description: 'Office rent - June', payment_method: 'bank_transfer', risk_level: 'medium', ai_note: 'This supplier payment is within normal range for monthly rent.', status: 'pending', requested_by: null, approved_by: null, rejected_reason: null, approved_at: null, created_at: new Date().toISOString() },
  { id: '2', company_id: SAMPLE_COMPANY_ID, request_type: 'supplier', amount: 15000, category: 'Supplies', payee_name: 'Global Traders', supplier_id: '4', staff_id: null, transaction_id: null, payroll_run_id: null, description: 'Office supplies', payment_method: 'cash', risk_level: 'low', ai_note: 'Payment amount is below your usual supplier average.', status: 'pending', requested_by: null, approved_by: null, rejected_reason: null, approved_at: null, created_at: new Date().toISOString() },
  { id: '3', company_id: SAMPLE_COMPANY_ID, request_type: 'salary', amount: 275000, category: 'Payroll', payee_name: 'Staff Salaries', supplier_id: null, staff_id: null, transaction_id: null, payroll_run_id: null, description: 'June 2026 payroll', payment_method: 'bank_transfer', risk_level: 'medium', ai_note: 'Monthly payroll for 4 staff members. Total is consistent with last month.', status: 'pending', requested_by: null, approved_by: null, rejected_reason: null, approved_at: null, created_at: new Date().toISOString() },
];

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

export async function getProfile(authUserId: string): Promise<Profile | null> {
  if (isDemoMode()) {
    return {
      id: 'profile-1',
      auth_user_id: authUserId,
      company_id: SAMPLE_COMPANY_ID,
      full_name: 'Kasun Perera',
      email: 'kasun@royaltravels.lk',
      phone: '+94771234567',
      role: 'owner',
      language: 'en',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function getCompany(companyId: string): Promise<Company | null> {
  if (isDemoMode()) {
    return {
      id: SAMPLE_COMPANY_ID,
      name: 'Royal Travels Office',
      business_type: 'travel_agency',
      currency: 'LKR',
      default_language: 'en',
      owner_name: 'Kasun Perera',
      tax_enabled: false,
      vat_rate: 18,
      sscl_enabled: false,
      sscl_rate: 2.5,
      service_charge_rate: 0,
      staff_module_enabled: true,
      approval_auto_limit: 5000,
      subscription_plan: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      max_users: 3,
      timezone: 'Asia/Colombo',
      role_permissions: null,
      created_at: new Date().toISOString(),
    };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();
  if (error) return null;
  return data as Company;
}

export async function getDashboardSummary(
  companyId: string,
  _period: string = 'daily'
): Promise<DashboardSummary> {
  if (isDemoMode()) return sampleDashboard;
  const supabase = getSupabase();
  const today = toISODate();
  const [incomeRes, expenseRes, accountsRes, staffRes, approvalsRes, customersRes, suppliersRes, leaveRes] =
    await Promise.all([
      supabase.from('transactions').select('amount').eq('company_id', companyId).eq('type', 'income').eq('transaction_date', today).eq('status', 'approved'),
      supabase.from('transactions').select('amount').eq('company_id', companyId).eq('type', 'expense').eq('transaction_date', today).in('status', ['approved', 'paid']),
      supabase.from('accounts').select('*').eq('company_id', companyId),
      supabase.from('staff').select('id').eq('company_id', companyId).eq('is_active', true),
      supabase.from('payment_requests').select('amount').eq('company_id', companyId).eq('status', 'pending'),
      supabase.from('customers').select('current_balance').eq('company_id', companyId),
      supabase.from('suppliers').select('current_balance').eq('company_id', companyId),
      supabase.from('leave_requests').select('id').eq('company_id', companyId).eq('status', 'pending'),
    ]);
  const todayIncome = incomeRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const todayExpenses = expenseRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const accounts = (accountsRes.data ?? []) as Account[];
  const cashBalance = accounts.find((a) => a.type === 'cash')?.current_balance ?? 0;
  const bankBalance = accounts.find((a) => a.type === 'bank')?.current_balance ?? 0;
  const staffTotal = staffRes.data?.length ?? 0;
  const pendingApprovals = approvalsRes.data?.length ?? 0;
  const pendingApprovalAmount = approvalsRes.data?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const receivables = customersRes.data?.reduce((s, c) => s + Number(c.current_balance), 0) ?? 0;
  const payables = suppliersRes.data?.reduce((s, s2) => s + Number(s2.current_balance), 0) ?? 0;
  return {
    todayIncome,
    todayExpenses,
    netProfit: todayIncome - todayExpenses,
    cashBalance: Number(cashBalance),
    bankBalance: Number(bankBalance),
    staffPresent: Math.max(0, staffTotal - 1),
    staffTotal,
    pendingApprovals,
    pendingApprovalAmount,
    pendingLeave: leaveRes.data?.length ?? 0,
    receivables,
    payables,
  };
}

export async function getBusinessTypeMetrics(
  companyId: string,
  businessType: string
): Promise<BusinessTypeMetrics | null> {
  if (businessType !== 'multi_vendor') return null;
  if (isDemoMode()) {
    return {
      commissionThisMonth: 85000,
      vendorSettlementsThisMonth: 62000,
      vendorCount: 3,
      hasActivity: true,
    };
  }

  const supabase = getSupabase();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = toISODate(now);

  const [commissionRes, settlementRes, vendorRes, activityRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount')
      .eq('company_id', companyId)
      .eq('type', 'income')
      .in('category', [...MULTI_VENDOR_COMMISSION_CATEGORIES])
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd)
      .in('status', ['approved', 'paid']),
    supabase
      .from('transactions')
      .select('amount')
      .eq('company_id', companyId)
      .eq('type', 'expense')
      .eq('category', MULTI_VENDOR_SETTLEMENT_CATEGORY)
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd)
      .in('status', ['approved', 'paid']),
    supabase.from('suppliers').select('id').eq('company_id', companyId),
    supabase.from('transactions').select('id').eq('company_id', companyId).limit(1),
  ]);

  const commissionThisMonth =
    commissionRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const vendorSettlementsThisMonth =
    settlementRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const vendorCount = vendorRes.data?.length ?? 0;
  const hasActivity = (activityRes.data?.length ?? 0) > 0 || vendorCount > 0;

  return {
    commissionThisMonth,
    vendorSettlementsThisMonth,
    vendorCount,
    hasActivity,
  };
}

export async function getTransactions(
  companyId: string,
  filters?: { type?: string; limit?: number; startDate?: string; endDate?: string }
): Promise<Transaction[]> {
  if (isDemoMode()) {
    let txs = [...sampleTransactions];
    if (filters?.type) txs = txs.filter((t) => t.type === filters.type);
    if (filters?.startDate) txs = txs.filter((t) => t.transaction_date >= filters.startDate!);
    if (filters?.endDate) txs = txs.filter((t) => t.transaction_date <= filters.endDate!);
    if (filters?.limit) txs = txs.slice(0, filters.limit);
    return txs;
  }
  const supabase = getSupabase();
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('transaction_date', { ascending: false });
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.startDate) query = query.gte('transaction_date', filters.startDate);
  if (filters?.endDate) query = query.lte('transaction_date', filters.endDate);
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function getCustomers(companyId: string): Promise<Customer[]> {
  if (isDemoMode()) return sampleCustomers;
  const supabase = getSupabase();
  const { data, error } = await supabase.from('customers').select('*').eq('company_id', companyId).order('name');
  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (isDemoMode()) {
    return sampleCustomers.find((c) => c.id === id) ?? sampleCustomers[0] ?? null;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Customer) ?? null;
}

export async function getSuppliers(companyId: string): Promise<Supplier[]> {
  if (isDemoMode()) return sampleSuppliers;
  const supabase = getSupabase();
  const { data, error } = await supabase.from('suppliers').select('*').eq('company_id', companyId).order('name');
  if (error) throw error;
  return (data ?? []) as Supplier[];
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  if (isDemoMode()) {
    return sampleSuppliers.find((s) => s.id === id) ?? sampleSuppliers[0] ?? null;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Supplier) ?? null;
}

export async function getStaff(companyId: string): Promise<Staff[]> {
  if (isDemoMode()) return sampleStaff;
  const supabase = getSupabase();
  const { data, error } = await supabase.from('staff').select('*').eq('company_id', companyId).eq('is_active', true).order('full_name');
  if (error) throw error;
  return (data ?? []) as Staff[];
}

export async function getPaymentRequests(
  companyId: string,
  status?: string
): Promise<PaymentRequest[]> {
  if (isDemoMode()) {
    if (status) return samplePaymentRequests.filter((p) => p.status === status);
    return samplePaymentRequests;
  }
  const supabase = getSupabase();
  let query = supabase.from('payment_requests').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PaymentRequest[];
}

export async function getLeaveRequests(companyId: string, status?: string): Promise<LeaveRequest[]> {
  if (isDemoMode()) {
    return [{
      id: '1', company_id: companyId, staff_id: '4', leave_type: 'casual', start_date: toISODate(), end_date: toISODate(), days: 1, reason: 'Personal matter', status: 'pending', approved_by: null, approved_at: null, created_at: new Date().toISOString(),
    }];
  }
  const supabase = getSupabase();
  let query = supabase.from('leave_requests').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LeaveRequest[];
}

export async function getExpenseCategories(
  companyId: string,
  options?: { includeHidden?: boolean }
): Promise<ExpenseCategory[]> {
  if (isDemoMode()) {
    return getExpenseCategoriesForBusinessType('travel_agency').map((c, i) => ({
      id: String(i + 1),
      company_id: companyId,
      name_en: c.name_en,
      name_si: c.name_si,
      name_ta: c.name_ta,
      icon: c.icon,
      color: c.color,
      is_default: true,
      is_hidden: false,
    }));
  }
  const supabase = getSupabase();
  let query = supabase.from('expense_categories').select('*').eq('company_id', companyId);
  if (!options?.includeHidden) {
    query = query.eq('is_hidden', false);
  }
  const { data, error } = await query;
  if (error) throw error;
  const categories = (data ?? []) as ExpenseCategory[];
  const seen = new Set<string>();
  return categories.filter((c) => {
    if (seen.has(c.name_en)) return false;
    seen.add(c.name_en);
    return true;
  });
}

export async function seedExpenseCategoriesForCompany(
  companyId: string,
  businessType: BusinessType = 'other'
) {
  const supabase = getSupabase();
  const templates = getExpenseCategoriesForBusinessType(businessType);
  const { data: existing } = await supabase
    .from('expense_categories')
    .select('name_en')
    .eq('company_id', companyId);
  const existingNames = new Set((existing ?? []).map((r) => r.name_en));
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
    }));
  if (toInsert.length === 0) return;
  const { error } = await supabase.from('expense_categories').insert(toInsert);
  if (error) throw error;
}

export async function getIncomeCategories(
  companyId: string,
  options?: { includeHidden?: boolean }
): Promise<IncomeCategory[]> {
  if (isDemoMode()) {
    return getIncomeCategoriesForBusinessType('travel_agency').map((c, i) => ({
      id: String(i + 1),
      company_id: companyId,
      name_en: c.name_en,
      name_si: c.name_si,
      name_ta: c.name_ta,
      icon: c.icon,
      color: c.color,
      is_default: true,
      is_hidden: false,
    }));
  }
  const supabase = getSupabase();
  let query = supabase.from('income_categories').select('*').eq('company_id', companyId);
  if (!options?.includeHidden) {
    query = query.eq('is_hidden', false);
  }
  const { data, error } = await query;
  if (error) throw error;
  const categories = (data ?? []) as IncomeCategory[];
  const seen = new Set<string>();
  return categories.filter((c) => {
    if (seen.has(c.name_en)) return false;
    seen.add(c.name_en);
    return true;
  });
}

export async function seedIncomeCategoriesForCompany(
  companyId: string,
  businessType: BusinessType = 'other'
) {
  const supabase = getSupabase();
  const templates = getIncomeCategoriesForBusinessType(businessType);
  const { data: existing } = await supabase
    .from('income_categories')
    .select('name_en')
    .eq('company_id', companyId);
  const existingNames = new Set((existing ?? []).map((r) => r.name_en));
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
    }));
  if (toInsert.length === 0) return;
  const { error } = await supabase.from('income_categories').insert(toInsert);
  if (error) throw error;
}

export async function getAccounts(companyId: string): Promise<Account[]> {
  if (isDemoMode()) {
    return [
      { id: '1', company_id: companyId, name: 'Cash', type: 'cash', current_balance: 95430, is_default: true, created_at: new Date().toISOString() },
      { id: '2', company_id: companyId, name: 'Bank', type: 'bank', current_balance: 420680, is_default: true, created_at: new Date().toISOString() },
    ];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.from('accounts').select('*').eq('company_id', companyId);
  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function getPayrollRuns(companyId: string): Promise<PayrollRun[]> {
  if (isDemoMode()) {
    return [{
      id: '1', company_id: companyId, month: 6, year: 2026, total_basic: 335000, total_advances: 0, total_deductions: 60000, total_payable: 275000, status: 'submitted', submitted_by: null, approved_by: null, approved_at: null, created_at: new Date().toISOString(),
    }];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.from('payroll_runs').select('*').eq('company_id', companyId).order('year', { ascending: false }).order('month', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PayrollRun[];
}

export async function getPayrollItems(runId: string): Promise<PayrollItemWithStaff[]> {
  if (isDemoMode()) {
    return sampleStaff.map((s, i) => {
      const epf = s.basic_salary * 0.08;
      return {
        id: String(i),
        payroll_run_id: runId,
        staff_id: s.id,
        basic_salary: s.basic_salary,
        allowance: 0,
        overtime: 0,
        advance: 0,
        deductions: 0,
        no_pay_deduction: 0,
        epf_employee: epf,
        epf_employer: s.basic_salary * 0.12,
        etf_employer: s.basic_salary * 0.03,
        apit: 0,
        net_payable: s.basic_salary - epf,
        status: 'pending',
        created_at: new Date().toISOString(),
        staff: {
          full_name: s.full_name,
          role_title: s.role_title,
          phone: s.phone,
          email: s.email,
        },
      };
    });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('payroll_items')
    .select('*, staff:staff_id(full_name, role_title, phone, email)')
    .eq('payroll_run_id', runId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as PayrollItemWithStaff[];
}

export async function getTeamMembers(companyId: string): Promise<Profile[]> {
  if (isDemoMode()) {
    return [{
      id: '1',
      auth_user_id: 'demo',
      company_id: companyId,
      full_name: 'Kasun Perera',
      email: 'owner@demo.com',
      phone: null,
      role: 'owner',
      language: 'en',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('full_name');
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getNotifications(profileId: string, limit = 20): Promise<Notification[]> {
  if (isDemoMode()) {
    return [
      {
        id: '1',
        company_id: SAMPLE_COMPANY_ID,
        user_id: profileId,
        type: 'approval',
        title: 'Expense needs approval',
        body: 'Fuel — Rs. 8,500',
        related_type: 'payment_request',
        related_id: '1',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        company_id: SAMPLE_COMPANY_ID,
        user_id: profileId,
        type: 'payroll',
        title: 'Payroll ready for review',
        body: 'June 2026 payroll submitted',
        related_type: 'payroll_run',
        related_id: '1',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        company_id: SAMPLE_COMPANY_ID,
        user_id: profileId,
        type: 'leave',
        title: 'Leave request pending',
        body: 'Kasun Perera — annual leave',
        related_type: 'leave_request',
        related_id: '1',
        is_read: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function getAttendance(companyId: string, date: string): Promise<Attendance[]> {
  if (isDemoMode()) {
    return sampleStaff.map((s, i) => ({
      id: String(i),
      company_id: companyId,
      staff_id: s.id,
      date,
      status: i === 3 ? 'leave' : i === 2 ? 'late' : 'present',
      check_in_time: '08:30',
      check_out_time: null,
      notes: null,
      marked_by: null,
      created_at: new Date().toISOString(),
    })) as Attendance[];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.from('attendance').select('*').eq('company_id', companyId).eq('date', date);
  if (error) throw error;
  return (data ?? []) as Attendance[];
}

export async function getAttendanceForRange(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Attendance[]> {
  if (isDemoMode()) {
    const records: Attendance[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = toISODate(d);
      const dayRecords = await getAttendance(companyId, day);
      records.push(...dayRecords);
    }
    return records;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw error;
  return (data ?? []) as Attendance[];
}

export async function getTransactionsForPeriod(
  companyId: string,
  period: PeriodType
): Promise<Transaction[]> {
  const { start, end } = getPeriodDateRange(period);
  return getTransactions(companyId, { startDate: start, endDate: end });
}

export async function createCompanyWithProfile(
  userId: string,
  email: string,
  setup: {
    businessName: string;
    businessType: string;
    currency: string;
    ownerName: string;
    staffModuleEnabled: boolean;
    taxEnabled: boolean;
    language: string;
  }
): Promise<{ companyId: string }> {
  if (isDemoMode()) return { companyId: SAMPLE_COMPANY_ID };
  const supabase = getSupabase();

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (existingProfile) {
    throw new Error('You already have a company linked to this account.');
  }

  const { data: company, error: companyError } = await supabase
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

  if (companyError || !company) {
    throw new Error(companyError?.message ?? 'Could not create company. Use the web setup page while signed in.');
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    auth_user_id: userId,
    company_id: company.id,
    full_name: setup.ownerName,
    email,
    role: 'owner',
    language: setup.language,
  });
  if (profileError) throw new Error(profileError.message);

  const { error: accountsError } = await supabase.from('accounts').insert([
    { company_id: company.id, name: 'Cash', type: 'cash', current_balance: 0, is_default: true },
    { company_id: company.id, name: 'Bank', type: 'bank', current_balance: 0, is_default: true },
  ]);
  if (accountsError) throw new Error(accountsError.message);

  await seedExpenseCategoriesForCompany(company.id, setup.businessType as BusinessType);
  await seedIncomeCategoriesForCompany(company.id, setup.businessType as BusinessType);
  return { companyId: company.id };
}

export async function getPendingCheques(companyId: string) {
  if (isDemoMode()) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('company_id', companyId)
    .eq('payment_method', 'cheque')
    .eq('cheque_status', 'pending')
    .order('transaction_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithPhoneOtp(phone: string) {
  const supabase = getSupabase();
  const normalized = phone.startsWith('+') ? phone : `+94${phone.replace(/^0/, '')}`;
  return supabase.auth.signInWithOtp({ phone: normalized });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = getSupabase();
  const normalized = phone.startsWith('+') ? phone : `+94${phone.replace(/^0/, '')}`;
  return supabase.auth.verifyOtp({ phone: normalized, token, type: 'sms' });
}

export async function resetPasswordForEmail(email: string) {
  const supabase = getSupabase();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : 'https://accounting-one-fawn.vercel.app/login';
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabase();
  return supabase.auth.updateUser({ password: newPassword });
}

export async function signUp(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = getSupabase();
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabase();
  return supabase.auth.getSession();
}

export interface GlobalSearchResult {
  id: string;
  type: 'customer' | 'supplier' | 'transaction' | 'staff';
  title: string;
  subtitle?: string;
  href: string;
}

function escapeIlike(term: string) {
  return term.replace(/[%_\\]/g, '\\$&');
}

function matchesTerm(value: string | null | undefined, term: string) {
  return (value ?? '').toLowerCase().includes(term);
}

export async function globalSearch(
  companyId: string,
  query: string
): Promise<GlobalSearchResult[]> {
  const term = query.trim().toLowerCase();
  if (term.length < 2) return [];

  if (isDemoMode()) {
    const results: GlobalSearchResult[] = [];
    for (const c of sampleCustomers) {
      if (matchesTerm(c.name, term) || matchesTerm(c.phone, term)) {
        results.push({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: c.phone ?? undefined,
          href: `/customers/${c.id}/edit`,
        });
      }
    }
    for (const s of sampleSuppliers) {
      if (matchesTerm(s.name, term) || matchesTerm(s.phone, term)) {
        results.push({
          id: s.id,
          type: 'supplier',
          title: s.name,
          subtitle: s.phone ?? undefined,
          href: `/suppliers/${s.id}/edit`,
        });
      }
    }
    for (const tx of sampleTransactions) {
      if (
        matchesTerm(tx.description, term) ||
        matchesTerm(tx.category, term) ||
        matchesTerm(tx.type, term)
      ) {
        const path = tx.type === 'income' ? '/income' : '/expenses';
        results.push({
          id: tx.id,
          type: 'transaction',
          title: tx.description ?? tx.category ?? tx.type,
          subtitle: `${tx.type} · Rs. ${tx.amount.toLocaleString()}`,
          href: path,
        });
      }
    }
    for (const st of sampleStaff) {
      if (matchesTerm(st.full_name, term) || matchesTerm(st.role_title, term)) {
        results.push({
          id: st.id,
          type: 'staff',
          title: st.full_name,
          subtitle: st.role_title,
          href: `/staff`,
        });
      }
    }
    return results.slice(0, 12);
  }

  const pattern = `%${escapeIlike(term)}%`;
  const supabase = getSupabase();

  const [customersRes, suppliersRes, txDescRes, txCatRes, staffRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, name, phone')
      .eq('company_id', companyId)
      .ilike('name', pattern)
      .limit(5),
    supabase
      .from('suppliers')
      .select('id, name, phone')
      .eq('company_id', companyId)
      .ilike('name', pattern)
      .limit(5),
    supabase
      .from('transactions')
      .select('id, type, description, category, amount')
      .eq('company_id', companyId)
      .ilike('description', pattern)
      .limit(5),
    supabase
      .from('transactions')
      .select('id, type, description, category, amount')
      .eq('company_id', companyId)
      .ilike('category', pattern)
      .limit(5),
    supabase
      .from('staff')
      .select('id, full_name, role_title')
      .eq('company_id', companyId)
      .ilike('full_name', pattern)
      .limit(5),
  ]);

  const results: GlobalSearchResult[] = [];

  for (const c of customersRes.data ?? []) {
    results.push({
      id: c.id,
      type: 'customer',
      title: c.name,
      subtitle: c.phone ?? undefined,
      href: `/customers/${c.id}/edit`,
    });
  }
  for (const s of suppliersRes.data ?? []) {
    results.push({
      id: s.id,
      type: 'supplier',
      title: s.name,
      subtitle: s.phone ?? undefined,
      href: `/suppliers/${s.id}/edit`,
    });
  }
  for (const tx of [...(txDescRes.data ?? []), ...(txCatRes.data ?? [])]) {
    if (results.some((r) => r.type === 'transaction' && r.id === tx.id)) continue;
    const path = tx.type === 'income' ? '/income' : '/expenses';
    results.push({
      id: tx.id,
      type: 'transaction',
      title: tx.description ?? tx.category ?? tx.type,
      subtitle: `${tx.type} · Rs. ${Number(tx.amount).toLocaleString()}`,
      href: path,
    });
  }
  for (const st of staffRes.data ?? []) {
    results.push({
      id: st.id,
      type: 'staff',
      title: st.full_name,
      subtitle: st.role_title,
      href: `/staff`,
    });
  }

  return results.slice(0, 12);
}
