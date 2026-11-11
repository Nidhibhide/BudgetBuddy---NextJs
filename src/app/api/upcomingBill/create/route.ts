import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { CreateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const { error } = CreateUpcomingBill().validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { dueDate, reminderDate, title, description, amount, status } = body;
    const parsedDueDate = parseLocalDate(dueDate);
    const parsedReminderDate = parseLocalDate(reminderDate);

    if (parsedReminderDate.getTime() > parsedDueDate.getTime()) {
      return JsonOne(
        400,
        "Reminder date must be on or before due date",
        false
      );
    }

    const newUpcomingBill = new UpcomingBill({
      title,
      description: description || "",
      amount,
      dueDate: parsedDueDate,
      reminderDate: parsedReminderDate,
      status,
      user: userId,
    });

    await newUpcomingBill.save();

    return JsonOne(201, "Upcoming bill added", true, {
      upcomingBill: newUpcomingBill,
    });
  });
}
