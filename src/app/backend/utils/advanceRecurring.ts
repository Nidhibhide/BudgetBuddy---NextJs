import RecurringPayment from "@/app/backend/models/recurringPayment";
import {
  daysBetween,
  parseLocalDate,
  subtractDays,
} from "@/app/lib/dateUtils";
import { Types } from "mongoose";

export function addFrequency(
  value: string | Date,
  frequency: string
): Date {
  const date = parseLocalDate(value);

  if (frequency === "Weekly") {
    date.setDate(date.getDate() + 7);
    return date;
  }

  if (frequency === "Yearly") {
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  // Monthly — keep day-of-month when possible
  const day = date.getDate();
  date.setMonth(date.getMonth() + 1);
  if (date.getDate() !== day) {
    date.setDate(0);
  }
  return date;
}

export function getAdvancedRecurringDates(
  nextDueDate: string | Date,
  reminderDate: string | Date,
  frequency: string
): { nextDueDate: Date; reminderDate: Date; advanced: boolean } {
  const today = parseLocalDate(new Date());
  let next = parseLocalDate(nextDueDate);
  const remindDays = Math.max(0, daysBetween(reminderDate, nextDueDate));
  let advanced = false;

  while (next.getTime() < today.getTime()) {
    next = addFrequency(next, frequency);
    advanced = true;
  }

  if (!advanced) {
    return {
      nextDueDate: parseLocalDate(nextDueDate),
      reminderDate: parseLocalDate(reminderDate),
      advanced: false,
    };
  }

  let reminder = subtractDays(next, remindDays);
  if (reminder.getTime() < today.getTime()) {
    reminder = today;
  }

  return { nextDueDate: next, reminderDate: reminder, advanced: true };
}

/** Advance Active recurring payments whose next due date is in the past. */
export async function advanceOverdueRecurringPayments(userId?: string) {
  const today = parseLocalDate(new Date());
  const match: Record<string, unknown> = {
    isDeleted: false,
    status: "Active",
    nextDueDate: { $lt: today },
  };

  if (userId) {
    match.user = new Types.ObjectId(userId);
  }

  const payments = await RecurringPayment.find(match);
  let updated = 0;

  for (const payment of payments) {
    const result = getAdvancedRecurringDates(
      payment.nextDueDate,
      payment.reminderDate,
      payment.frequency
    );

    if (!result.advanced) continue;

    payment.nextDueDate = result.nextDueDate;
    payment.reminderDate = result.reminderDate;
    payment.reminderEmailSent = false;
    await payment.save({ validateModifiedOnly: true });
    updated += 1;
  }

  return updated;
}
