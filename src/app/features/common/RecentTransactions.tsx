import React from 'react';
import { Card } from '@/components/ui/card';

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

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <Card className="p-6 text-foreground flex flex-col h-[710px]">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
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

export default RecentTransactions;