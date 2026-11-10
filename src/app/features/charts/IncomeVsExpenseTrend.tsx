'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { IncomeVsExpenseTrendProps } from '@/app/types/appTypes';

const IncomeVsExpenseTrend: React.FC<IncomeVsExpenseTrendProps> = ({ data }) => {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();

  const now = new Date();
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = data?.find(d => d.month === month);
    chartData.push({
      month,
      income: existing?.income || 0,
      expense: existing?.expense || 0
    });
  }

  const isDark = resolvedTheme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#f8fafc' : '#0f172a';

  return (
    <Card className="p-6 text-foreground bg-card border-border shadow-md">
      <h3 className="text-lg font-semibold mb-4">Income vs Expense Trend</h3>
      <div className="h-72 sm:h-96">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="month"
              stroke={axisColor}
              tick={{ fill: axisColor }}
              tickFormatter={(value: string) => {
                const [year, month] = value.split("-");
                return new Date(Number(year), Number(month) - 1).toLocaleString(
                  "default",
                  { month: "short" }
                );
              }}
              interval={0}
            />
            <YAxis stroke={axisColor} tick={{ fill: axisColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                color: textColor,
              }}
              formatter={(value: number) => [`${value.toLocaleString()} ${session?.user?.currency || 'INR'}`, '']}
            />
            <Legend wrapperStyle={{ color: textColor }} />
            <Bar dataKey="income" fill="#10B981" name="Income" />
            <Bar dataKey="expense" fill="#EF4444" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default IncomeVsExpenseTrend;
