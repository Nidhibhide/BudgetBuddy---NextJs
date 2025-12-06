import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getBalance } from "@/app/lib/dashboard";

export const useBalance = () => {
  const t = useTranslations();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBalance(t);
      if (response.success) {
        setBalance(response.data.balance || 0);
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
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
};