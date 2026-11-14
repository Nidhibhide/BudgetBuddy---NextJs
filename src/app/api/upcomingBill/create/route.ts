import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import User from "@/app/backend/models/user";
import { CreateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";
import {
  convertToINR,
  convertFromINR,
} from "@/app/backend/utils/currencyConverter";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const { error } = CreateUpcomingBill().validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { dueDate, reminderDate, title, description, amount } = body;
    const parsedDueDate = parseLocalDate(dueDate);
    const parsedReminderDate = parseLocalDate(reminderDate);

    if (parsedReminderDate.getTime() > parsedDueDate.getTime()) {
      return JsonOne(
        400,
        "Reminder date must be on or before due date",
        false
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    const amountInINR = await convertToINR(amount, user.currency || "INR");

    const newUpcomingBill = new UpcomingBill({
      title,
      description: description || "",
      amount: amountInINR,
      dueDate: parsedDueDate,
      reminderDate: parsedReminderDate,
      status: "Unpaid",
      user: userId,
    });

    await newUpcomingBill.save();

    return JsonOne(201, "Upcoming bill added", true, {
      upcomingBill: {
        ...newUpcomingBill.toObject(),
        amount: await convertFromINR(
          newUpcomingBill.amount,
          user.currency || "INR"
        ),
      },
    });
  });
}
