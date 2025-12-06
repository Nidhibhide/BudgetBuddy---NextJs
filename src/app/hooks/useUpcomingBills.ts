import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getUpcomingBills } from "@/app/lib/upcomingBill";
import type { UpcomingBill, UseUpcomingBillsProps } from "@/app/types/appTypes";

export const useUpcomingBills = ({
  status = "All",
  page = 1,
  limit = 10,
  sortBy = "dueDate",
  sortOrder = "asc",
}: UseUpcomingBillsProps) => {
  const t = useTranslations();
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
        t,
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
        setError(response.message || t('backend.api.errorOccurred'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('backend.api.errorOccurred')
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
