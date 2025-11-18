import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface InsightsProps {
  insights: string[];
}

export const Insights: React.FC<InsightsProps> = ({ insights }) => {
  const t = useTranslations('widgets');
  return (
    <Card className="p-6 text-foreground flex flex-col h-[710px]">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold">{t('insights.financialInsights')}</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-base text-gray-700 dark:text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const t = useTranslations('widgets');
  return (
    <Card className="p-6 text-foreground flex flex-col h-[710px]">
      <h3 className="text-lg font-semibold mb-4">{t('insights.recentTransactions')}</h3>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-base">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.date} • {transaction.category}</p>
              </div>
              <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface TotalBalanceProps {
  balance: number;
}

export const TotalBalance: React.FC<TotalBalanceProps> = ({ balance }) => {
  const t = useTranslations('widgets');
  return (
    <Card className="p-6 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] dark:from-[#818cf8] dark:to-[#4f46e5] text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('insights.totalBalance')}</h3>
          <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
        </div>
        <div className="text-4xl opacity-80">
          💰
        </div>
      </div>
    </Card>
  );
};