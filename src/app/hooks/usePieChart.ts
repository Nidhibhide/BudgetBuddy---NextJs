import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getPieChart } from "@/app/lib/dashboard";
import { colorPalette } from '@/constants';
import { MonthlyExpensesResponse, ExpenseData } from '@/app/types/appTypes';

export const usePieChart = () => {
  const t = useTranslations();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPieChart(t);
      if (response.success) {
        const data: MonthlyExpensesResponse = response.data;
        const transformedExpenses: ExpenseData[] = data.categories.map((cat, index) => ({
          name: cat.category,
          value: cat.total,
          color: colorPalette[index % colorPalette.length],
        }));
        setExpenses(transformedExpenses);
      } else {
        setError(response.message || t('backend.api.errorOccurred'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('backend.api.errorOccurred')
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMonthlyExpenses();
  }, [fetchMonthlyExpenses]);

  return {
    expenses,
    loading,
    error,
    refetch: fetchMonthlyExpenses,
  };
};