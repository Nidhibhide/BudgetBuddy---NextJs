'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface TrendData {
  month: string;
  income: number;
  expense: number;
}

interface IncomeVsExpenseTrendProps {
  data: TrendData[];
}

const IncomeVsExpenseTrend: React.FC<IncomeVsExpenseTrendProps> = ({ data }) => {
  return (
    <Card className="p-6 text-foreground">
      <h3 className="text-lg font-semibold mb-4">Income vs Expense Trend (6 Months)</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name="Income" />
            <Bar dataKey="expense" fill="#EF4444" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default IncomeVsExpenseTrend;