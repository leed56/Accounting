import type { RiskLevel } from '@bizmanager/types';

export function requiresOwnerApproval(
  amount: number,
  autoLimit: number,
  requestType: string
): boolean {
  if (requestType === 'salary' || requestType === 'supplier') return true;
  if (amount > autoLimit) return true;
  return false;
}

export function calculateRiskLevel(
  amount: number,
  autoLimit: number,
  cashBalance: number
): RiskLevel {
  if (amount > cashBalance) return 'high';
  if (amount > autoLimit * 3) return 'high';
  if (amount > autoLimit) return 'medium';
  return 'low';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    default:
      return '#16A34A';
  }
}
