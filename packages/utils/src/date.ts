const COLOMBO_TZ = 'Asia/Colombo';

export function formatDate(
  date: string | Date,
  locale = 'en-LK',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    timeZone: COLOMBO_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateTime(date: string | Date, locale = 'en-LK'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    timeZone: COLOMBO_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function toISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getStartOfMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export function getMonthName(month: number, locale = 'en'): string {
  const date = new Date(2000, month - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
}

export function getDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}
