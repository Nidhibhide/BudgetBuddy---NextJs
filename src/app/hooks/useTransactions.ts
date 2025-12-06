import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getTransactions, getTransactionTotals } from "@/app/lib/transaction";
import type {
  Transaction,
  TypeTotal,
  UseTransactionsProps,
} from "@/app/types/appTypes";

export const useTransactions = ({
  type,
  category,
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  search,
  dateFrom,
  dateTo,
  minAmount,
  maxAmount,
}: UseTransactionsProps) => {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<TypeTotal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    limit: 10,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTransactions(
        type,
        t,
        category,
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount
      );
      if (response.success) {
        setTransactions(response.data || []);
        setPagination((prev) => response.pagination || prev);
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
  }, [type, category, page, limit, sortBy, sortOrder, search, dateFrom, dateTo, minAmount, maxAmount, t]);

  const fetchTotals = useCallback(async () => {
    try {
      const totalsResult = await getTransactionTotals(type, t);
      if (totalsResult.success && totalsResult.data) {
        setTotals(totalsResult.data);
      }
    } catch (err) {
      console.error(t('backend.api.errorOccurred'), err);
    }
  }, [type, t]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return {
    transactions,
    totals,
    loading,
    error,
    pagination,
    refetch: fetchTransactions,
    refetchTotals: fetchTotals,
  };
};
