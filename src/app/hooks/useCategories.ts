import { useState, useEffect, useCallback } from "react";
import { getCategoryDetails } from "@/app/lib/category";
import type { Category } from "@/app/types/appTypes";
import { useTranslations } from 'next-intl'; // Import for internationalization

export const useCategories = (type: string) => {
  const t = useTranslations('common'); // Get translation function for the 'common' namespace
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategoryDetails(type);
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || t('messages.failedToFetchCategories'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.unexpectedError'));
    } finally {
      setLoading(false);
    }
  }, [type, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};