import { useState, useEffect, useCallback } from "react";
import { getUpcomingBills } from "@/app/lib/upcomingBill";
import type { UpcomingBill, UseUpcomingBillsProps } from "@/app/types/appTypes";
import { useTranslations } from 'next-intl'; // Import for internationalization

export const useUpcomingBills = ({
  status = "All",
  page = 1,
  limit = 10,
  sortBy = "dueDate",
  sortOrder = "asc",
}: UseUpcomingBillsProps) => {
  const t = useTranslations('common'); // Get translation function for the 'common' namespace
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUpcomingBills: 0,
    limit: 10,
  });

  const fetchUpcomingBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUpcomingBills(
        status,
        page,
        limit,
        sortBy,
        sortOrder
      );
      if (response.success) {
        setUpcomingBills(response.data || []);
        setPagination((prev) => response.pagination || prev);
      } else {
        setError(response.message || t('messages.failedToFetchUpcomingBills'));
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
    fetchUpcomingBills();
  }, [fetchUpcomingBills]);

  return {
    upcomingBills,
    loading,
    error,
    pagination,
    refetch: fetchUpcomingBills,
  };
};
