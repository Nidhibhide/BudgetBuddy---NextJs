import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { UpdateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { parseLocalDate } from "@/app/lib/dateUtils";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    const body = await request.json();
    const { error } = UpdateUpcomingBill().validate(body);
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

    const existingUpcomingBill = await UpcomingBill.findOne({
      _id: upcomingBillId,
      user: userId,
      isDeleted: false,
    });

    if (!existingUpcomingBill) {
      return JsonOne(404, "Upcoming bill not found", false);
    }

    const updatedUpcomingBill = await UpcomingBill.findByIdAndUpdate(
      upcomingBillId,
      {
        title,
        description: description || "",
        amount,
        dueDate: parsedDueDate,
        reminderDate: parsedReminderDate,
        status,
      },
      { new: true, runValidators: true }
    );

    return JsonOne(200, "Upcoming bill updated", true, {
      upcomingBill: updatedUpcomingBill,
    });
  });
}
