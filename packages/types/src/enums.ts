export const USER_ROLES = ['owner', 'manager', 'accountant', 'staff'] as const;
export type UserRole = typeof USER_ROLES[number];

export const TRANSACTION_TYPES = [
  'income',
  'expense',
  'salary',
  'supplier_payment',
  'customer_payment',
  'staff_advance',
  'refund',
  'transfer',
] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

export const TRANSACTION_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'paid',
  'cancelled',
] as const;
export type TransactionStatus = typeof TRANSACTION_STATUSES[number];

export const PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'card',
  'cheque',
  'lankaqr',
  'online',
  'other',
] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'half_day',
  'late',
  'leave',
] as const;
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
export type LeaveStatus = typeof LEAVE_STATUSES[number];

export const LEAVE_TYPES = ['annual', 'sick', 'casual', 'no_pay', 'other'] as const;
export type LeaveType = typeof LEAVE_TYPES[number];

export const PAYROLL_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'paid',
  'cancelled',
] as const;
export type PayrollStatus = typeof PAYROLL_STATUSES[number];

export const PAYMENT_REQUEST_TYPES = [
  'expense',
  'salary',
  'supplier',
  'advance',
  'other',
] as const;
export type PaymentRequestType = typeof PAYMENT_REQUEST_TYPES[number];

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export type RiskLevel = typeof RISK_LEVELS[number];

export const BUSINESS_TYPES = [
  'travel_agency',
  'retail_shop',
  'service_business',
  'office_admin',
  'restaurant_cafe',
  'freelancer_agency',
  'construction_contractor',
  'salon_beauty',
  'tuition_education',
  'transport_hire',
  'workshop_repair',
  'other',
] as const;
export type BusinessType = typeof BUSINESS_TYPES[number];

export const ACCOUNT_TYPES = ['cash', 'bank'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export const PERIOD_TYPES = ['daily', 'weekly', 'monthly'] as const;
export type PeriodType = typeof PERIOD_TYPES[number];
