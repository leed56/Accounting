export interface NotificationPreferences {
  notifyApprovals: boolean;
  notifyPayroll: boolean;
  notifyLeave: boolean;
}

type Notifiable = {
  type: string;
  related_type: string | null;
};

export function shouldShowNotification(
  notification: Notifiable,
  prefs: NotificationPreferences
): boolean {
  const type = notification.type.toLowerCase();
  const related = (notification.related_type ?? '').toLowerCase();

  if (
    type.includes('payroll') ||
    related.includes('payroll') ||
    type.includes('salary')
  ) {
    return prefs.notifyPayroll;
  }

  if (type.includes('leave') || related.includes('leave')) {
    return prefs.notifyLeave;
  }

  if (
    type.includes('approval') ||
    related.includes('payment_request') ||
    type.includes('expense') ||
    related.includes('expense')
  ) {
    return prefs.notifyApprovals;
  }

  return true;
}

export function filterNotificationsByPrefs<T extends Notifiable>(
  notifications: T[],
  prefs: NotificationPreferences
): T[] {
  return notifications.filter((n) => shouldShowNotification(n, prefs));
}
