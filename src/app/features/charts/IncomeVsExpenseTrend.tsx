'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { IncomeVsExpenseTrendProps } from '@/app/types/appTypes';

const IncomeVsExpenseTrend: React.FC<IncomeVsExpenseTrendProps> = ({ data }) => {
  const t = useTranslations('dashboard');
  const { data: session } = useSession();

  // Generate last 6 months data, merging with actual data if available
  const now = new Date(); // Get current date
  const chartData = []; // Initialize empty array for chart data
  for (let i = 5; i >= 0; i--) { // Loop from 5 to 0 to get last 6 months (oldest first)
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1); // Calculate the date for each month
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format month as YYYY-MM
    const existing = data?.find(d => d.month === month); // Check if backend data has this month
    chartData.push({ // Add to chart data array
      month, // Month string
      income: existing?.income || 0, // Use income from data or 0
      expense: existing?.expense || 0 // Use expense from data or 0
    });
  }

  return (
    <Card className="p-6 text-foreground">
      <h3 className="text-lg font-semibold mb-4">{t('ui.incomeVsExpenseTrend')}</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ${session?.user?.currency || 'INR'}`, '']} />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name={t('constants.types.income')} />
            <Bar dataKey="expense" fill="#EF4444" name={t('constants.types.expense')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default IncomeVsExpenseTrend;