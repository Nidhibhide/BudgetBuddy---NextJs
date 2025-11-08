import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { UpdateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    if (!upcomingBillId) {
      return JsonOne(400, "Upcoming bill ID is required", false);
    }

    const body = await request.json();
    const { error } = UpdateUpcomingBill.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { dueDate, reminderDate, title, description, amount, status } = body;

    // Validate that reminderDate is before dueDate
    if (new Date(reminderDate) >= new Date(dueDate)) {
      return JsonOne(400, "Reminder date must be before due date", false);
    }

    const existingUpcomingBill = await UpcomingBill.findOne({
      _id: upcomingBillId,
      user: userId,
      isDeleted: false,
    });

    if (!existingUpcomingBill) {
      return JsonOne(404, "Upcoming bill not found", false);
    }

    const updateData = {
      title,
      description,
      amount,
      dueDate: new Date(dueDate),
      reminderDate: new Date(reminderDate),
      status,
    };

    const updatedUpcomingBill = await UpcomingBill.findByIdAndUpdate(
      upcomingBillId,
      updateData,
      { new: true }
    );

    return JsonOne(200, "Upcoming bill updated successfully", true, {
      upcomingBill: updatedUpcomingBill,
    });
  });
}