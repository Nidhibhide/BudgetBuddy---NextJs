import { useState, useEffect, useCallback } from "react";
import { getBudgetCalendar } from "@/app/lib/dashboard";
import { useTranslations } from 'next-intl';
import { DayData, BudgetCalendarResponse} from '@/app/types/appTypes';

export const useBudgetCalendar = (month: number, year: number) => {
  const t = useTranslations('common');
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBudgetCalendar(month, year);
      if (response.success) {
        const data: BudgetCalendarResponse = response.data;
        setDaysData(data.days);
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
  }, [month, year, t]);

  useEffect(() => {
    fetchBudgetCalendar();
  }, [fetchBudgetCalendar]);

  return {
    daysData,
    loading,
    error,
    refetch: fetchBudgetCalendar,
  };
};