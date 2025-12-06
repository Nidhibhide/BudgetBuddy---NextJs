import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getCategoryDetails } from "@/app/lib/category";
import type { Category } from "@/app/types/appTypes";

export const useCategories = (type: string) => {
  const t = useTranslations();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategoryDetails(type, t);
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || t('backend.api.errorOccurred'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('backend.api.errorOccurred'));
    } finally {
      setLoading(false);
    }
  }, [type, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};