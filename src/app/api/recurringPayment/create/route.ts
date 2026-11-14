import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { CreateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";
import {
  convertToINR,
  convertFromINR,
} from "@/app/backend/utils/currencyConverter";

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

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    const amountInINR = await convertToINR(amount, user.currency || "INR");

    const newRecurringPayment = new RecurringPayment({
      title,
      description: description || "",
      amount: amountInINR,
      nextDueDate: parsedNextDueDate,
      reminderDate: parsedReminderDate,
      frequency,
      status,
      user: userId,
    });

    await newRecurringPayment.save();

    return JsonOne(201, "Recurring payment added", true, {
      recurringPayment: {
        ...newRecurringPayment.toObject(),
        amount: await convertFromINR(
          newRecurringPayment.amount,
          user.currency || "INR"
        ),
      },
    });
  });
}
