import { z } from 'zod';
import {
  BUSINESS_TYPES,
  LEAVE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_REQUEST_TYPES,
} from './enums';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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

export const incomeSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  customerId: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountId: z.string().optional().nullable(),
  transactionDate: z.string(),
  notes: z.string().optional().nullable(),
  markAsPaid: z.boolean().default(true),
});

export const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  transactionDate: z.string(),
  notes: z.string().optional().nullable(),
  requiresApproval: z.boolean().default(false),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  openingBalance: z.coerce.number().default(0),
});

export const supplierSchema = customerSchema;

export const customerUpdateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
});

export const supplierUpdateSchema = customerUpdateSchema;

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

export const expenseCategorySchema = z.object({
  name_en: z.string().min(1, 'Name is required').max(80),
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
});

export type LoginInput = z.infer<typeof loginSchema>;
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
