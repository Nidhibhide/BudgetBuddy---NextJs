import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CATEGORIES } from "../../lib/constants";
import { AppState } from "../types/appTypes";

const appStore = create<AppState>()(
  persist(
    (set) => ({
      categories: CATEGORIES,
      limit: 0,

      setCategories: (categories: string[]) => set({ categories }),
      setLimit: (limit: number) => set({ limit }),
    }),
    { name: "app-setting" }
  )
);

export default appStore;