import { useState, useEffect, useCallback } from "react";
import { getInsights } from "@/app/lib/dashboard";
import { useTranslations } from 'next-intl';

export const useInsights = () => {
  const t = useTranslations('common');
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInsights();
      if (response.success) {
        setInsights([
          t('widgets.insights.default1'),
          t('widgets.insights.default2'),
          t('widgets.insights.default3'),
          t('widgets.insights.default4'),
          t('widgets.insights.default5'),
          ...(response.data?.insights || [])
        ]);
      } else {
        setError(response.message || t('messages.failedToFetchInsights'));
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
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights,
  };
};
