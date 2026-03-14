import { useState, useEffect, useCallback } from "react";
import { getInsights } from "@/app/lib/dashboard";

export const useInsights = () => {
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
          "Track your expenses to better understand your spending habits",
          "Set a monthly budget to control your spending",
          "Review your transactions regularly to stay on top of your finances",
          ...(response.data?.insights || [])
        ]);
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
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights,
  };
};
