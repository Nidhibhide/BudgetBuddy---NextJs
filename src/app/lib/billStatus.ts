import { parseLocalDate } from "@/app/lib/dateUtils";

export type BillDisplayStatus =
  | "Upcoming"
  | "Due Today"
  | "Overdue"
  | "Paid";

export function getBillDisplayStatus(
  dueDate: string | Date,
  storedStatus?: string
): BillDisplayStatus {
  if (storedStatus === "Paid") return "Paid";

  const due = parseLocalDate(dueDate).getTime();
  const today = parseLocalDate(new Date()).getTime();

  if (due === today) return "Due Today";
  if (due < today) return "Overdue";
  return "Upcoming";
}

export function getBillStatusClass(status: BillDisplayStatus): string {
  switch (status) {
    case "Paid":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "Due Today":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "Overdue":
      return "bg-red-500/15 text-red-700 dark:text-red-300";
    case "Upcoming":
    default:
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  }
}
