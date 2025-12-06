import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getInsights } from "@/app/lib/dashboard";

export const useInsights = () => {
  const t = useTranslations();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInsights(t);
      if (response.success) {
        // Use t.raw() to get the array of default insights since t() only supports strings
        setInsights([
          ...t.raw('common.hooks.defaultInsights'),
          ...(response.data?.insights || [])
        ]);
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
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights,
  };
};
