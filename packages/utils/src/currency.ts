const DEFAULT_LOCALE = 'en-LK';

export function formatCurrency(
  amount: number,
  currency = 'LKR',
  locale = DEFAULT_LOCALE
): string {
  if (currency === 'LKR') {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs. ${formatted}`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
