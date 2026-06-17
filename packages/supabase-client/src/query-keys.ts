export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  company: (companyId: string) => ['company', companyId] as const,
  dashboard: (companyId: string, period: string) =>
    ['dashboard', companyId, period] as const,
  transactions: (companyId: string, filters?: Record<string, string>) =>
    ['transactions', companyId, filters] as const,
  customers: (companyId: string) => ['customers', companyId] as const,
  customer: (id: string) => ['customer', id] as const,
  suppliers: (companyId: string) => ['suppliers', companyId] as const,
  supplier: (id: string) => ['supplier', id] as const,
  staff: (companyId: string) => ['staff', companyId] as const,
  attendance: (companyId: string, date: string) =>
    ['attendance', companyId, date] as const,
  leaveRequests: (companyId: string, status?: string) =>
    ['leaveRequests', companyId, status] as const,
  payrollRuns: (companyId: string) => ['payrollRuns', companyId] as const,
  paymentRequests: (companyId: string, status?: string) =>
    ['paymentRequests', companyId, status] as const,
  categories: (companyId: string) => ['categories', companyId] as const,
  accounts: (companyId: string) => ['accounts', companyId] as const,
  aiInsights: (companyId: string) => ['aiInsights', companyId] as const,
  reports: (companyId: string, type: string, period: string) =>
    ['reports', companyId, type, period] as const,
  auditLogs: (companyId: string) => ['auditLogs', companyId] as const,
  payrollItems: (runId: string) => ['payrollItems', runId] as const,
  teamMembers: (companyId: string) => ['teamMembers', companyId] as const,
};
