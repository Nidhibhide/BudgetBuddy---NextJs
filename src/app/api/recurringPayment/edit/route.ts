import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { UpdateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    const body = await request.json();
    const { error } = UpdateRecurringPayment().validate(body);
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

    const existingRecurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!existingRecurringPayment) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    const updatedRecurringPayment = await RecurringPayment.findByIdAndUpdate(
      recurringPaymentId,
      {
        title,
        description: description || "",
        amount,
        nextDueDate: parsedNextDueDate,
        reminderDate: parsedReminderDate,
        frequency,
        status,
      },
      { new: true, runValidators: true }
    );

    return JsonOne(200, "Recurring payment updated", true, {
      recurringPayment: updatedRecurringPayment,
    });
  });
}
