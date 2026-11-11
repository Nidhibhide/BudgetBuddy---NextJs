import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { CreateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const { error } = CreateRecurringPayment().validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const {
      nextDueDate,
      reminderDate,
      title,
      description,
      amount,
      frequency,
      status,
    } = body;
    const parsedNextDueDate = parseLocalDate(nextDueDate);
    const parsedReminderDate = parseLocalDate(reminderDate);

    if (parsedReminderDate.getTime() > parsedNextDueDate.getTime()) {
      return JsonOne(
        400,
        "Reminder date must be on or before next due date",
        false
      );
    }

    const newRecurringPayment = new RecurringPayment({
      title,
      description: description || "",
      amount,
      nextDueDate: parsedNextDueDate,
      reminderDate: parsedReminderDate,
      frequency,
      status,
      user: userId,
    });

    await newRecurringPayment.save();

    return JsonOne(201, "Recurring payment added", true, {
      recurringPayment: newRecurringPayment,
    });
  });
}
