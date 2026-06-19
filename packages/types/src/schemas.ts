import { z } from 'zod';
import {
  BUSINESS_TYPES,
  CHEQUE_STATUSES,
  LEAVE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_REQUEST_TYPES,
} from './enums';

const paymentMetaFields = {
  paymentReference: z.string().optional().nullable(),
  chequeNumber: z.string().optional().nullable(),
  chequeStatus: z.enum(CHEQUE_STATUSES).optional().nullable(),
};

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const phoneOtpRequestSchema = z.object({
  phone: z.string().min(9, 'Enter a valid phone number').max(15),
});

export const phoneOtpVerifySchema = phoneOtpRequestSchema.extend({
  token: z.string().length(6, 'Enter the 6-digit code'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Name is required'),
});

export const companySetupSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.enum(BUSINESS_TYPES),
  currency: z.string().default('LKR'),
  ownerName: z.string().min(2, 'Owner name is required'),
  numberOfStaff: z.coerce.number().min(0).max(100),
  staffModuleEnabled: z.boolean().default(true),
  taxEnabled: z.boolean().default(false),
  language: z.enum(['en', 'si', 'ta']).default('en'),
});

export const incomeSchema = z
  .object({
    category: z.string().min(1, 'Category is required'),
    customerId: z.string().optional().nullable(),
    supplierId: z.string().optional().nullable(),
    amount: z.coerce.number().positive('Amount must be positive'),
    paymentMethod: z.enum(PAYMENT_METHODS),
    accountId: z.string().optional().nullable(),
    transactionDate: z.string(),
    notes: z.string().optional().nullable(),
    markAsPaid: z.boolean().default(true),
    ...paymentMetaFields,
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'cheque' && !data.chequeNumber?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Cheque number is required', path: ['chequeNumber'] });
    }
    if (data.paymentMethod === 'lankaqr' && !data.paymentReference?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'LankaQR reference is required', path: ['paymentReference'] });
    }
  });

export const expenseSchema = z
  .object({
    category: z.string().min(1, 'Category is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    paymentMethod: z.enum(PAYMENT_METHODS),
    accountId: z.string().optional().nullable(),
    supplierId: z.string().optional().nullable(),
    transactionDate: z.string(),
    notes: z.string().optional().nullable(),
    requiresApproval: z.boolean().default(false),
    ...paymentMetaFields,
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'cheque' && !data.chequeNumber?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Cheque number is required', path: ['chequeNumber'] });
    }
    if (data.paymentMethod === 'lankaqr' && !data.paymentReference?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'LankaQR reference is required', path: ['paymentReference'] });
    }
  });

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  openingBalance: z.coerce.number().default(0),
});

export const supplierSchema = customerSchema.extend({
  commissionRate: z.coerce.number().min(0).max(100).default(0),
});

export const customerUpdateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
});

export const supplierUpdateSchema = customerUpdateSchema.extend({
  commissionRate: z.coerce.number().min(0).max(100).optional(),
});

export const staffSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  roleTitle: z.string().min(1, 'Role is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  basicSalary: z.coerce.number().min(0),
  salaryType: z.string().default('monthly'),
  joinedDate: z.string().optional().nullable(),
});

export const leaveRequestSchema = z.object({
  staffId: z.string().min(1),
  leaveType: z.enum(LEAVE_TYPES),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional().nullable(),
});

export const attendanceEntrySchema = z.object({
  staffId: z.string(),
  status: z.enum(['present', 'absent', 'half_day', 'late', 'leave']),
  notes: z.string().optional().nullable(),
});

export const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  comment: z.string().optional().nullable(),
});

export const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().min(2, 'Name is required'),
  role: z.enum(['manager', 'accountant', 'staff']),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().optional().nullable(),
  unit: z.string().default('pcs'),
  costPrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  quantityOnHand: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  branchId: z.string().optional().nullable(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  movementType: z.enum(['in', 'out', 'adjustment']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unitCost: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const journalLineSchema = z.object({
  accountCode: z.string().min(1),
  accountId: z.string().optional().nullable(),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
  description: z.string().optional().nullable(),
});

export const journalEntrySchema = z.object({
  entryDate: z.string(),
  reference: z.string().optional().nullable(),
  description: z.string().min(2, 'Description is required'),
  branchId: z.string().optional().nullable(),
  lines: z.array(journalLineSchema).min(2, 'At least two lines required'),
});

export const settlementItemInputSchema = z.object({
  supplierId: z.string().min(1),
  amount: z.coerce.number().positive('Amount must be positive'),
  notes: z.string().optional().nullable(),
});

export const settlementRunSchema = z.object({
  runDate: z.string(),
  accountId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(settlementItemInputSchema).min(1, 'Select at least one vendor'),
});

export const bankReconciliationSchema = z.object({
  accountId: z.string().min(1, 'Bank account is required'),
  statementDate: z.string(),
  openingBalance: z.coerce.number(),
  closingBalance: z.coerce.number(),
  notes: z.string().optional().nullable(),
});

export const bankStatementLineSchema = z.object({
  lineDate: z.string(),
  description: z.string().optional().nullable(),
  amount: z.coerce.number(),
  reference: z.string().optional().nullable(),
});

export const expenseCategorySchema = z.object({
  name_en: z.string().min(1, 'Name is required').max(80),
});

const rolePermissionFlagsSchema = z.object({
  can_write: z.boolean(),
  can_approve: z.boolean(),
  can_invite: z.boolean(),
  can_manage_settings: z.boolean(),
});

export const rolePermissionsSchema = z.object({
  manager: rolePermissionFlagsSchema,
  accountant: rolePermissionFlagsSchema,
  staff: rolePermissionFlagsSchema,
});

export const settingsSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().optional().nullable(),
  currency: z.string(),
  defaultLanguage: z.enum(['en', 'si', 'ta']),
  taxEnabled: z.boolean(),
  vatRate: z.coerce.number().min(0).max(100),
  ssclEnabled: z.boolean(),
  ssclRate: z.coerce.number().min(0).max(100),
  serviceChargeRate: z.coerce.number().min(0).max(100),
  approvalAutoLimit: z.coerce.number().min(0),
  staffModuleEnabled: z.boolean(),
  rolePermissions: rolePermissionsSchema.optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PhoneOtpRequestInput = z.infer<typeof phoneOtpRequestSchema>;
export type PhoneOtpVerifyInput = z.infer<typeof phoneOtpVerifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CompanySetupInput = z.infer<typeof companySetupSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type SettlementRunInput = z.infer<typeof settlementRunSchema>;
export type BankReconciliationInput = z.infer<typeof bankReconciliationSchema>;
export type BankStatementLineInput = z.infer<typeof bankStatementLineSchema>;
