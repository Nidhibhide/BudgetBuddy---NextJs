import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { UpdateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId, t) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    const body = await request.json();
    const { error } = UpdateUpcomingBill(t).validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { dueDate, reminderDate, title, description, amount, status } = body;

    // Validate that reminderDate is before dueDate
    if (new Date(reminderDate) >= new Date(dueDate)) {
      return JsonOne(400, t("backend.api.reminderBeforeDue"), false);
    }

    const existingUpcomingBill = await UpcomingBill.findOne({
      _id: upcomingBillId,
      user: userId,
      isDeleted: false,
    });

    if (!existingUpcomingBill) {
      return JsonOne(404, t("backend.api.upcomingBillNotFound"), false);
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

    return JsonOne(200, t("backend.api.success"), true, {
      upcomingBill: updatedUpcomingBill,
    });
  });
}