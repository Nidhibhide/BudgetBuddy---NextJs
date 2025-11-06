import React from 'react';
import { Card } from '@/components/ui/card';

interface TotalBalanceProps {
  balance: number;
}

const TotalBalance: React.FC<TotalBalanceProps> = ({ balance }) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] dark:from-[#818cf8] dark:to-[#4f46e5] text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
          <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
        </div>
        <div className="text-4xl opacity-80">
          💰
        </div>
      </div>
    </Card>
  );
};

export default TotalBalance;