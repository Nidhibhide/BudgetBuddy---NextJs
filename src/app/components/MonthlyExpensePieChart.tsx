'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
}

interface MonthlyExpensePieChartProps {
  expenses: ExpenseData[];
}

const MonthlyExpensePieChart: React.FC<MonthlyExpensePieChartProps> = ({ expenses }) => {
  const data = expenses.map(exp => ({
    name: exp.category,
    value: exp.amount,
    color: exp.color,
  }));


  return (
    <Card className="p-6 text-foreground">
      <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlyExpensePieChart;