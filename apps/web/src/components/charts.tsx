'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '@/stores/app-store';
import type { AttendanceChartItem, CategoryChartItem, TrendChartItem } from '@bizmanager/utils';
import { formatCurrency } from '@bizmanager/utils';

function useChartTheme() {
  const darkMode = useAppStore((s) => s.darkMode);
  return {
    grid: darkMode ? '#374151' : '#E5E7EB',
    tick: darkMode ? '#9CA3AF' : '#6B7280',
    tooltipBg: darkMode ? '#111827' : '#FFFFFF',
    tooltipBorder: darkMode ? '#374151' : '#E5E7EB',
  };
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
}

export function IncomeExpenseChart({
  data,
  incomeLabel = 'Income',
  expenseLabel = 'Expenses',
  emptyMessage = 'No data for this period',
}: {
  data?: TrendChartItem[];
  incomeLabel?: string;
  expenseLabel?: string;
  emptyMessage?: string;
}) {
  const theme = useChartTheme();
  if (!data?.length) return <ChartEmpty message={emptyMessage} />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.tick }} />
        <YAxis tick={{ fontSize: 12, fill: theme.tick }} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          formatter={(v: number) => [formatCurrency(v), '']}
          contentStyle={{ backgroundColor: theme.tooltipBg, borderColor: theme.tooltipBorder }}
        />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2} name={incomeLabel} />
        <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name={expenseLabel} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({
  data,
  emptyMessage = 'No data for this period',
}: {
  data?: CategoryChartItem[];
  emptyMessage?: string;
}) {
  const theme = useChartTheme();
  if (!data?.length) return <ChartEmpty message={emptyMessage} />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
          {data.map((entry, i) => (
            <Cell key={entry.name_en + i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => formatCurrency(v)}
          contentStyle={{ backgroundColor: theme.tooltipBg, borderColor: theme.tooltipBorder }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ExpenseCategoryChart(props: {
  data?: CategoryChartItem[];
  emptyMessage?: string;
}) {
  return <CategoryPieChart {...props} />;
}

export function IncomeCategoryChart(props: {
  data?: CategoryChartItem[];
  emptyMessage?: string;
}) {
  return <CategoryPieChart {...props} />;
}

export function AttendanceBarChart({
  data,
  presentLabel = 'Present',
  emptyMessage = 'No attendance data',
}: {
  data?: AttendanceChartItem[];
  presentLabel?: string;
  emptyMessage?: string;
}) {
  const theme = useChartTheme();
  if (!data?.length) return <ChartEmpty message={emptyMessage} />;

  const maxPresent = Math.max(...data.map((d) => d.present), 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: theme.tick }} />
        <YAxis tick={{ fontSize: 12, fill: theme.tick }} domain={[0, maxPresent]} allowDecimals={false} />
        <Tooltip contentStyle={{ backgroundColor: theme.tooltipBg, borderColor: theme.tooltipBorder }} />
        <Bar dataKey="present" fill="#16A34A" radius={[4, 4, 0, 0]} name={presentLabel} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card h-full">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function CategoryBreakdownList({
  items,
  emptyMessage = 'No data for this period',
}: {
  items?: CategoryChartItem[];
  emptyMessage?: string;
}) {
  if (!items?.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>;
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name_en} className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.label}</span>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-medium">{formatCurrency(item.value)}</span>
            {total > 0 && (
              <span className="ml-2 text-gray-500">{Math.round((item.value / total) * 100)}%</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
