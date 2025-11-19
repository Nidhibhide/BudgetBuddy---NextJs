import { useState, useEffect, useCallback } from "react";
import { getBarGraph } from "@/app/lib/dashboard";
import { useTranslations } from 'next-intl';
import { MonthlySummaryResponse, TrendData } from '@/app/types/appTypes';

export const useBarGraph = () => {
  const t = useTranslations('common');
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
        setError(response.message || t('messages.unexpectedError'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('messages.unexpectedError')
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