import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getBarGraph } from "@/app/lib/dashboard";
import { MonthlySummaryResponse, TrendData } from '@/app/types/appTypes';

export const useBarGraph = () => {
  const t = useTranslations();
  const [summary, setSummary] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlySummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBarGraph(t);
      if (response.success) {
        const data: MonthlySummaryResponse = response.data;
        setSummary(data);
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
    fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchMonthlySummary,
  };
};