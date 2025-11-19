'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { IncomeVsExpenseTrendProps } from '@/app/types/appTypes';

const IncomeVsExpenseTrend: React.FC<IncomeVsExpenseTrendProps> = ({ data }) => {
  const t = useTranslations('dashboard');

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-foreground">
        <h3 className="text-lg font-semibold mb-4">{t('ui.incomeVsExpenseTrend')}</h3>
        <div className="h-96 flex items-center justify-center">No data available</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-foreground">
      <h3 className="text-lg font-semibold mb-4">{t('ui.incomeVsExpenseTrend')}</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
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