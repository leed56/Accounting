import type { Language } from '@bizmanager/i18n';

export const PDF_REPORT_LABELS: Record<
  Language,
  {
    reportTitle: string;
    income: string;
    expenses: string;
    netProfit: string;
    receivables: string;
    payables: string;
    expensesByCategory: string;
    incomeByCategory: string;
    topReceivables: string;
    topPayables: string;
    payslipTitle: string;
    employee: string;
    netPay: string;
    period: string;
  }
> = {
  en: {
    reportTitle: 'Business Report',
    income: 'Income',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    receivables: 'Receivables',
    payables: 'Payables',
    expensesByCategory: 'Expenses by Category',
    incomeByCategory: 'Income by Category',
    topReceivables: 'Top Receivables',
    topPayables: 'Top Payables',
    payslipTitle: 'Payslip',
    employee: 'Employee',
    netPay: 'Net Pay',
    period: 'Period',
  },
  si: {
    reportTitle: 'ව්‍යාපාර වාර්තාව',
    income: 'ආදායම',
    expenses: 'වියදම්',
    netProfit: 'ශුද්ධ ලාභය',
    receivables: 'ලැබිය යුතු',
    payables: 'ගෙවිය යුතු',
    expensesByCategory: 'ප්‍රවර්ග අනුව වියදම්',
    incomeByCategory: 'ප්‍රවර්ග අනුව ආදායම',
    topReceivables: 'ප්‍රධාන ලැබිය යුතු',
    topPayables: 'ප්‍රධාන ගෙවිය යුතු',
    payslipTitle: 'වැටුප් පත්‍රය',
    employee: 'සේවක',
    netPay: 'ශුද්ධ වැටුප',
    period: 'කාලය',
  },
  ta: {
    reportTitle: 'வணிக அறிக்கை',
    income: 'வருமானம்',
    expenses: 'செலவுகள்',
    netProfit: 'நிகர லாபம்',
    receivables: 'பெறத்தக்கவை',
    payables: 'செலுத்த வேண்டியவை',
    expensesByCategory: 'வகை வாரியாக செலவுகள்',
    incomeByCategory: 'வகை வாரியாக வருமானம்',
    topReceivables: 'முக்கிய பெறத்தக்கவை',
    topPayables: 'முக்கிய செலுத்த வேண்டியவை',
    payslipTitle: 'ஊதிய சீட்டு',
    employee: 'ஊழியர்',
    netPay: 'நிகர ஊதியம்',
    period: 'காலம்',
  },
};
