export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-GB");
};

/** Parse YYYY-MM-DD (or Date) as a local calendar day at midnight. */
export const parseLocalDate = (value: string | Date): Date => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/** True when the calendar day is today or in the future. */
export const isDateNotPast = (value: Date): boolean => {
  const day = parseLocalDate(value);
  const today = parseLocalDate(new Date());
  return day.getTime() >= today.getTime();
};