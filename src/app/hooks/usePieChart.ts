import { useState, useEffect, useCallback } from "react";
import { getPieChart } from "@/app/lib/dashboard";
import { colorPalette } from '@/constants';
import { MonthlyExpensesResponse, ExpenseData } from '@/app/types/appTypes';

export const usePieChart = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPieChart();
      if (response.success) {
        const data: MonthlyExpensesResponse = response.data;
        const transformedExpenses: ExpenseData[] = data.categories.map((cat, index) => ({
          name: cat.category,
          value: cat.total,
          color: colorPalette[index % colorPalette.length],
        }));
        setExpenses(transformedExpenses);
      } else {
        setError(response.message || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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