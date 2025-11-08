"use client";

import { TotalBalance, RecentTransactions } from "@/app/features/common";
import {
  MonthlyExpensePieChart,
  IncomeVsExpenseTrend,
  BudgetCalendar,
  Insights,
} from "@/app/features/charts";
import { mockData } from "@/app/lib/mockData";

const MainPage: React.FC = () => {
  return (
    <div className="w-full px-6 py-4 mx-auto space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
      </div>

      {/* Total Balance */}
      <TotalBalance balance={mockData.totalBalance} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyExpensePieChart expenses={mockData.monthlyExpenses} />
        <IncomeVsExpenseTrend data={mockData.incomeVsExpenseTrend} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecentTransactions transactions={mockData.recentTransactions} />
        <BudgetCalendar transactions={mockData.recentTransactions} />
        <Insights insights={mockData.insights} />
      </div>
    </div>
  );
};

export default MainPage;
