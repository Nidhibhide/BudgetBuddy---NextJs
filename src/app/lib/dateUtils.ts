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

/** Format a Date as YYYY-MM-DD for date inputs. */
export const toDateInputValue = (value: string | Date): string => {
  const date = parseLocalDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Subtract whole days from a calendar date. */
export const subtractDays = (value: string | Date, days: number): Date => {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() - days);
  return date;
};

/** Whole calendar days from start to end (end - start). */
export const daysBetween = (
  start: string | Date,
  end: string | Date
): number => {
  const startMs = parseLocalDate(start).getTime();
  const endMs = parseLocalDate(end).getTime();
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
};

/** True when the calendar day is today or in the future. */
export const isDateNotPast = (value: Date): boolean => {
  const day = parseLocalDate(value);
  const today = parseLocalDate(new Date());
  return day.getTime() >= today.getTime();
};