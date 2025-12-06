'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { MonthlyExpensePieChartProps } from '@/app/types/appTypes';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

const MonthlyExpensePieChart: React.FC<MonthlyExpensePieChartProps> = ({ expenses }) => {
  const t = useTranslations();
  const { data: session } = useSession();
  const currency = session?.user?.currency || 'INR';
  const data = expenses;

  return (
    <Card className="p-6 text-foreground">
      <h3 className="text-lg font-semibold mb-4">{t('charts.monthlyExpensePieChart.title')}</h3>
      <div className="h-96">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <X className="w-12 h-12 text-red-600" />
            <p>{t('common.notFound.defaultTitle')}</p>
          </div>
        ) : (
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
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, t('backend.validation.amount')]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default MonthlyExpensePieChart;