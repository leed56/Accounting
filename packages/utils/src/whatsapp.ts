import type { Language } from '@bizmanager/i18n';
import { formatCurrency } from './currency';

type Party = { name: string; phone?: string | null; balance: number };
type Company = { name: string };

const labels = {
  en: {
    receivableReminder: 'Payment reminder from',
    payableReminder: 'Payment due to',
    balance: 'Outstanding balance',
    invoice: 'Invoice from',
    thanks: 'Thank you — please arrange payment at your earliest convenience.',
  },
  si: {
    receivableReminder: 'ගෙවීම් напомina',
    payableReminder: 'ගෙවිය යුතු මුදල',
    balance: 'ඉතිරි ශේෂය',
    invoice: 'Invoice from',
    thanks: 'ස්තුතියි — කරුණාකර ගෙවීම සකස් කරන්න.',
  },
  ta: {
    receivableReminder: 'கட்டண நினைவூட்டல்',
    payableReminder: 'செலுத்த வேண்டிய தொகை',
    balance: 'நிலுவை இருப்பு',
    invoice: 'Invoice from',
    thanks: 'நன்றி — தயவுசெய்து கட்டணம் செலுத்தவும்.',
  },
} as const;

export function buildReceivableReminderMessage(
  company: Company,
  customer: Party,
  language: Language = 'en'
) {
  const l = labels[language];
  const phone = customer.phone ? `\nPhone: ${customer.phone}` : '';
  return `${l.receivableReminder} ${company.name}

Customer: ${customer.name}${phone}
${l.balance}: ${formatCurrency(customer.balance)}

${l.thanks}`;
}

export function buildPayableReminderMessage(
  company: Company,
  supplier: Party,
  language: Language = 'en'
) {
  const l = labels[language];
  const phone = supplier.phone ? `\nPhone: ${supplier.phone}` : '';
  return `${l.payableReminder} ${supplier.name}

From: ${company.name}${phone}
${l.balance}: ${formatCurrency(supplier.balance)}

${l.thanks}`;
}

export function buildCustomerInvoiceMessage(
  company: Company,
  customer: Party,
  amount: number,
  description: string,
  language: Language = 'en'
) {
  const l = labels[language];
  return `${l.invoice} ${company.name}

Customer: ${customer.name}
Amount: ${formatCurrency(amount)}
For: ${description}

${l.thanks}`;
}
