"use client";

import {
  TotalBalance,
  RecentTransactions,
  Insights,
} from "@/app/features/common";
import {
  MonthlyExpensePieChart,
  IncomeVsExpenseTrend,
  BudgetCalendar,
} from "@/app/features/charts";
import { useBalance, usePieChart, useBarGraph } from "@/app/hooks";

const MainPage: React.FC = () => {
  const { balance, loading: balanceLoading } = useBalance();
  const { expenses, loading: expensesLoading } = usePieChart();
  const { summary, loading: summaryLoading } = useBarGraph();

  return (
    <div className="w-full px-4 sm:px-6 py-4 mx-auto space-y-6 bg-background">
      <div className="relative">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        </div>
      </div>

      <TotalBalance balance={balance} loading={balanceLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyExpensePieChart
          expenses={expenses}
          loading={expensesLoading}
        />
        <IncomeVsExpenseTrend data={summary} loading={summaryLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <RecentTransactions />
        <BudgetCalendar />
        <Insights />
      </div>
    </div>
  );
};

export default MainPage;
