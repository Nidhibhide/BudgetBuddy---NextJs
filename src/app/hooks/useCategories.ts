import { useState, useEffect, useCallback } from "react";
import { getCategoryDetails } from "@/app/lib/category";
import type { Category } from "@/app/types/appTypes";

export const useCategories = (type: string) => {
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
        setError(response.message || "Failed to fetch categories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};