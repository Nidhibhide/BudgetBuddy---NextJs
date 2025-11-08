import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { CreateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function POST(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const body = await request.json();
    const { error } = CreateUpcomingBill.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { dueDate, reminderDate, title, description, amount, status } = body;

    // Validate that reminderDate is before dueDate
    if (new Date(reminderDate) >= new Date(dueDate)) {
      return JsonOne(400, "Reminder date must be before due date", false);
    }

    const newUpcomingBill = new UpcomingBill({
      title,
      description,
      amount,
      dueDate: new Date(dueDate),
      reminderDate: new Date(reminderDate),
      status,
      user: userId,
    });

    await newUpcomingBill.save();

    return JsonOne(201, "Upcoming bill created successfully", true, {
      upcomingBill: newUpcomingBill,
    });
  });
}