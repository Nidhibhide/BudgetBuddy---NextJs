import { useState, useEffect, useCallback } from "react";
import { getRecurringPayments } from "@/app/lib/recurringPayment";
import type { RecurringPayment, UseUpcomingBillsProps } from "@/app/types/appTypes";
import { useTranslations } from 'next-intl'; // Import for internationalization

export const useRecurringPayments = ({
  status = "All",
  page = 1,
  limit = 10,
  sortBy = "nextDueDate",
  sortOrder = "asc",
}: UseUpcomingBillsProps) => {
  const t = useTranslations('common'); // Get translation function for the 'common' namespace
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecurringPayments: 0,
    limit: 10,
  });

  const fetchRecurringPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecurringPayments(
        status,
        page,
        limit,
        sortBy,
        sortOrder
      );
      if (response.success) {
        setRecurringPayments(response.data || []);
        setPagination((prev) => response.pagination || prev);
      } else {
        setError(response.message || t('messages.failedToFetchRecurringPayments'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('messages.unexpectedError')
      );
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, sortBy, sortOrder, t]);

  useEffect(() => {
    fetchRecurringPayments();
  }, [fetchRecurringPayments]);

  return {
    recurringPayments,
    loading,
    error,
    pagination,
    refetch: fetchRecurringPayments,
  };
};