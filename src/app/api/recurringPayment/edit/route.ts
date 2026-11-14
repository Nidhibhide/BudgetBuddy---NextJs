import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { UpdateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";
import {
  convertToINR,
  convertFromINR,
} from "@/app/backend/utils/currencyConverter";

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

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    const existingRecurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!existingRecurringPayment) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    const reminderChanged =
      existingRecurringPayment.reminderDate.getTime() !==
      parsedReminderDate.getTime();

    const amountInINR = await convertToINR(amount, user.currency || "INR");

    const updatedRecurringPayment = await RecurringPayment.findByIdAndUpdate(
      recurringPaymentId,
      {
        title,
        description: description || "",
        amount: amountInINR,
        nextDueDate: parsedNextDueDate,
        reminderDate: parsedReminderDate,
        frequency,
        status,
        ...(reminderChanged ? { reminderEmailSent: false } : {}),
      },
      { new: true, runValidators: true }
    );

    return JsonOne(200, "Recurring payment updated", true, {
      recurringPayment: {
        ...updatedRecurringPayment!.toObject(),
        amount: await convertFromINR(
          updatedRecurringPayment!.amount,
          user.currency || "INR"
        ),
      },
    });
  });
}
