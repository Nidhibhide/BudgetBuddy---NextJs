import { useState, useEffect, useCallback } from "react";
import { getBalance } from "@/app/lib/dashboard";
import { useTranslations } from 'next-intl';

export const useBalance = () => {
  const t = useTranslations('common');
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBalance();
      if (response.success) {
        setBalance(response.data.balance || 0);
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
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
};