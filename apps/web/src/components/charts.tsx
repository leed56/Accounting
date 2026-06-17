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

export function IncomeExpenseChart() {
  const data = [
    { name: 'Mon', income: 95000, expense: 42000 },
    { name: 'Tue', income: 110000, expense: 55000 },
    { name: 'Wed', income: 85000, expense: 48000 },
    { name: 'Thu', income: 125750, expense: 68540 },
    { name: 'Fri', income: 98000, expense: 51000 },
    { name: 'Sat', income: 72000, expense: 38000 },
    { name: 'Sun', income: 45000, expense: 22000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, '']} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2} name="Income" />
        <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Expenses" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ExpenseCategoryChart() {
  const data = [
    { name: 'Rent', value: 75000, color: '#3B82F6' },
    { name: 'Fuel', value: 12750, color: '#F59E0B' },
    { name: 'Internet', value: 8500, color: '#06B6D4' },
    { name: 'Other', value: 15290, color: '#9CA3AF' },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AttendanceBarChart() {
  const data = [
    { day: 'Mon', present: 4 },
    { day: 'Tue', present: 3 },
    { day: 'Wed', present: 4 },
    { day: 'Thu', present: 3 },
    { day: 'Fri', present: 4 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[0, 4]} />
        <Tooltip />
        <Bar dataKey="present" fill="#16A34A" radius={[4, 4, 0, 0]} name="Present" />
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
    <div className="card">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
