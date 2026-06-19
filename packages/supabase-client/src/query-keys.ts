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
  categories: (companyId: string, scope: 'active' | 'all' = 'active') =>
    ['categories', companyId, scope] as const,
  incomeCategories: (companyId: string, scope: 'active' | 'all' = 'active') =>
    ['incomeCategories', companyId, scope] as const,
  accounts: (companyId: string) => ['accounts', companyId] as const,
  aiInsights: (companyId: string) => ['aiInsights', companyId] as const,
  reports: (companyId: string, type: string, period: string) =>
    ['reports', companyId, type, period] as const,
  auditLogs: (companyId: string) => ['auditLogs', companyId] as const,
  payrollItems: (runId: string) => ['payrollItems', runId] as const,
  teamMembers: (companyId: string) => ['teamMembers', companyId] as const,
  notifications: (profileId: string) => ['notifications', profileId] as const,
  search: (companyId: string, q: string) => ['search', companyId, q] as const,
  pendingCheques: (companyId: string) => ['pendingCheques', companyId] as const,
  businessMetrics: (companyId: string, businessType: string) =>
    ['businessMetrics', companyId, businessType] as const,
  branches: (companyId: string) => ['branches', companyId] as const,
  products: (companyId: string) => ['products', companyId] as const,
  product: (id: string) => ['product', id] as const,
  stockMovements: (productId: string) => ['stockMovements', productId] as const,
  journalEntries: (companyId: string) => ['journalEntries', companyId] as const,
  journalEntry: (id: string) => ['journalEntry', id] as const,
  settlementRuns: (companyId: string) => ['settlementRuns', companyId] as const,
  settlementRun: (id: string) => ['settlementRun', id] as const,
  bankReconciliations: (companyId: string) => ['bankReconciliations', companyId] as const,
  bankReconciliation: (id: string) => ['bankReconciliation', id] as const,
  bankStatementLines: (reconId: string) => ['bankStatementLines', reconId] as const,
  supplierTransactions: (supplierId: string) => ['supplierTransactions', supplierId] as const,
  vendorCommissionReport: (companyId: string, start: string, end: string) =>
    ['vendorCommissionReport', companyId, start, end] as const,
};
