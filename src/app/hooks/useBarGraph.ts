import { useState, useEffect, useCallback } from "react";
import { getBarGraph } from "@/app/lib/dashboard";
import { MonthlySummaryResponse, TrendData } from '@/app/types/appTypes';

export const useBarGraph = () => {
  const [summary, setSummary] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlySummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBarGraph();
      if (response.success) {
        const data: MonthlySummaryResponse = response.data;
        setSummary(data);
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
    fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchMonthlySummary,
  };
};