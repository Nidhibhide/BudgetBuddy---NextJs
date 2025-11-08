import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { UpdateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    if (!recurringPaymentId) {
      return JsonOne(400, "Recurring payment ID is required", false);
    }

    const body = await request.json();
    const { error } = UpdateRecurringPayment.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { nextDueDate, reminderDate, title, description, amount, frequency, status } = body;

    // Validate that reminderDate is before nextDueDate
    if (new Date(reminderDate) >= new Date(nextDueDate)) {
      return JsonOne(400, "Reminder date must be before next due date", false);
    }

    const existingRecurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!existingRecurringPayment) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    const updateData = {
      title,
      description,
      amount,
      nextDueDate: new Date(nextDueDate),
      reminderDate: new Date(reminderDate),
      frequency,
      status,
    };

    const updatedRecurringPayment = await RecurringPayment.findByIdAndUpdate(
      recurringPaymentId,
      updateData,
      { new: true }
    );

    return JsonOne(200, "Recurring payment updated successfully", true, {
      recurringPayment: updatedRecurringPayment,
    });
  });
}