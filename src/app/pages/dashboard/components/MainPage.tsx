"use client";

import { TotalBalance, RecentTransactions } from "@/app/features/common";
import {
  MonthlyExpensePieChart,
  IncomeVsExpenseTrend,
  BudgetCalendar,
} from "@/app/features/charts";
import { Insights } from "@/app/features/common";
import { mockData } from "@/app/lib/mockData";
import { useTranslations } from 'next-intl'; // Import for internationalization
import { LanguageSelector } from '@/app/features/common';

const MainPage: React.FC = () => {
  // Get translation function for the 'dashboard' namespace
  // This provides access to all dashboard-related translations
  const t = useTranslations('dashboard');


  return (
    <div className="w-full px-6 py-4 mx-auto space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="relative">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">{t('overview.overview')}</h1>
        </div>
        <div className="absolute top-0 right-0">
          <LanguageSelector className="w-32 border-0" />
        </div>
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
