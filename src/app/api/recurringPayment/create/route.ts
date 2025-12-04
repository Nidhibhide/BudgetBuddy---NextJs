import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { CreateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function POST(request: Request) {
  return await withAuthAndDB(async (session, userId, t) => {
    const body = await request.json();
    const { error } = CreateRecurringPayment(t).validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { nextDueDate, reminderDate, title, description, amount, frequency, status } = body;

    // Validate that reminderDate is before nextDueDate
    if (new Date(reminderDate) >= new Date(nextDueDate)) {
      return JsonOne(400, t("backend.api.reminderBeforeDue"), false);
    }

    const newRecurringPayment = new RecurringPayment({
      title,
      description,
      amount,
      nextDueDate: new Date(nextDueDate),
      reminderDate: new Date(reminderDate),
      frequency,
      status,
      user: userId,
    });

    await newRecurringPayment.save();

    return JsonOne(201, t("backend.api.success"), true, {
      recurringPayment: newRecurringPayment,
    });
  });
}