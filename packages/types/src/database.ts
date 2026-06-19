import type {
  AttendanceStatus,
  BusinessType,
  ChequeStatus,
  LeaveStatus,
  LeaveType,
  PaymentMethod,
  PaymentRequestType,
  PayrollStatus,
  RiskLevel,
  SubscriptionPlan,
  TransactionStatus,
  TransactionType,
  UserRole,
} from './enums';

export interface RolePermissionFlagsJson {
  can_write: boolean;
  can_approve: boolean;
  can_invite: boolean;
  can_manage_settings: boolean;
}

export interface CompanyRolePermissionsJson {
  manager: RolePermissionFlagsJson;
  accountant: RolePermissionFlagsJson;
  staff: RolePermissionFlagsJson;
}

export interface Company {
  id: string;
  name: string;
  business_type: BusinessType;
  currency: string;
  default_language: string;
  owner_name: string | null;
  tax_enabled: boolean;
  vat_rate: number;
  sscl_enabled: boolean;
  sscl_rate: number;
  service_charge_rate: number;
  staff_module_enabled: boolean;
  approval_auto_limit: number;
  subscription_plan: SubscriptionPlan;
  trial_ends_at: string | null;
  max_users: number;
  timezone: string;
  role_permissions: CompanyRolePermissionsJson | null;
  created_at: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  language: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  company_id: string;
  name: string;
  type: 'cash' | 'bank';
  current_balance: number;
  is_default: boolean;
  created_at: string;
}

export interface Staff {
  id: string;
  company_id: string;
  profile_id: string | null;
  full_name: string;
  role_title: string;
  phone: string | null;
  email: string | null;
  basic_salary: number;
  salary_type: string;
  joined_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_balance: number;
  current_balance: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  company_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_balance: number;
  current_balance: number;
  commission_rate: number;
  branch_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  company_id: string;
  type: TransactionType;
  category: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  cheque_number: string | null;
  cheque_status: ChequeStatus | null;
  cheque_cleared_at: string | null;
  status: TransactionStatus;
  account_id: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  staff_id: string | null;
  description: string | null;
  transaction_date: string;
  requires_approval: boolean;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface DevicePushToken {
  id: string;
  profile_id: string;
  company_id: string;
  expo_push_token: string;
  platform: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface IncomeCategory {
  id: string;
  company_id: string;
  name_en: string;
  name_si: string | null;
  name_ta: string | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  is_hidden: boolean;
}

export interface ExpenseCategory {
  id: string;
  company_id: string;
  name_en: string;
  name_si: string | null;
  name_ta: string | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  is_hidden: boolean;
}

export interface Attendance {
  id: string;
  company_id: string;
  staff_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  marked_by: string | null;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  company_id: string;
  staff_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface PayrollRun {
  id: string;
  company_id: string;
  month: number;
  year: number;
  total_basic: number;
  total_advances: number;
  total_deductions: number;
  total_payable: number;
  status: PayrollStatus;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface PayrollItem {
  id: string;
  payroll_run_id: string;
  staff_id: string;
  basic_salary: number;
  allowance: number;
  overtime: number;
  advance: number;
  deductions: number;
  no_pay_deduction: number;
  epf_employee: number;
  epf_employer: number;
  etf_employer: number;
  apit: number;
  net_payable: number;
  status: string;
  created_at: string;
}

export interface PayrollItemWithStaff extends PayrollItem {
  staff: Pick<Staff, 'full_name' | 'role_title' | 'phone' | 'email'>;
}

export interface PaymentRequest {
  id: string;
  company_id: string;
  request_type: PaymentRequestType;
  amount: number;
  category: string | null;
  payee_name: string | null;
  supplier_id: string | null;
  staff_id: string | null;
  transaction_id: string | null;
  payroll_run_id: string | null;
  description: string | null;
  payment_method: PaymentMethod | null;
  risk_level: RiskLevel;
  ai_note: string | null;
  status: TransactionStatus;
  requested_by: string | null;
  approved_by: string | null;
  rejected_reason: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface AiInsight {
  id: string;
  company_id: string;
  insight_type: string;
  title: string;
  message: string;
  severity: string;
  language: string;
  related_type: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  related_type: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface BusinessTypeMetrics {
  commissionThisMonth: number;
  vendorSettlementsThisMonth: number;
  vendorCount: number;
  hasActivity: boolean;
}

export interface DashboardSummary {
  todayIncome: number;
  todayExpenses: number;
  netProfit: number;
  cashBalance: number;
  bankBalance: number;
  staffPresent: number;
  staffTotal: number;
  pendingApprovals: number;
  pendingApprovalAmount: number;
  pendingLeave: number;
  receivables: number;
  payables: number;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  branch_id: string | null;
  sku: string | null;
  name: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  quantity_on_hand: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
}

export interface StockMovement {
  id: string;
  company_id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_cost: number | null;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  company_id: string;
  branch_id: string | null;
  entry_date: string;
  reference: string | null;
  description: string;
  status: 'posted' | 'void';
  transaction_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  account_code: string;
  account_id: string | null;
  debit: number;
  credit: number;
  description: string | null;
}

export interface SettlementRun {
  id: string;
  company_id: string;
  branch_id: string | null;
  run_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'cancelled';
  total_amount: number;
  notes: string | null;
  account_id: string | null;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
}

export interface SettlementItem {
  id: string;
  settlement_run_id: string;
  supplier_id: string;
  amount: number;
  transaction_id: string | null;
  notes: string | null;
}

export interface BankReconciliation {
  id: string;
  company_id: string;
  account_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  status: 'open' | 'closed';
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BankStatementLine {
  id: string;
  reconciliation_id: string;
  line_date: string;
  description: string | null;
  amount: number;
  reference: string | null;
  transaction_id: string | null;
  is_matched: boolean;
}

export interface VendorCommissionRow {
  supplier_id: string;
  supplier_name: string;
  commission_rate: number;
  commission_total: number;
  settlements_total: number;
  balance: number;
}
