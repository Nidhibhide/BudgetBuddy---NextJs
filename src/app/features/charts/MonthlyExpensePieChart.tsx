'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { MonthlyExpensePieChartProps } from '@/app/types/appTypes';
import { X } from 'lucide-react';

const ChartPlaceholder = () => (
  <div className="h-full rounded-md border border-border bg-card" />
);

const MonthlyExpensePieChart: React.FC<MonthlyExpensePieChartProps> = ({
  expenses,
  loading = false,
}) => {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currency = session?.user?.currency || 'INR';
  const data = expenses;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const legendColor = isDark ? '#f8fafc' : '#0f172a';
  const showPlaceholder = loading || !mounted;

  return (
    <Card className="p-6 text-foreground bg-card border-border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
      <div className="h-72 sm:h-96">
        {showPlaceholder ? (
          <ChartPlaceholder />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <X className="w-12 h-12 text-foreground/60" />
            <p>No Data Found</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
                label={false}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: legendColor,
                }}
                formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, "Amount"]}
              />
              <Legend wrapperStyle={{ color: legendColor }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default MonthlyExpensePieChart;
