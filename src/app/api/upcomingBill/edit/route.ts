import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { UpdateUpcomingBill } from "@/app/backend/validations/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getT } from "@/app/backend/utils/getTranslations";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const t = await getT();
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    if (!upcomingBillId) {
      return JsonOne(400, t('backend.upcomingBill.idRequired'), false);
    }

    const body = await request.json();
    const { error } = UpdateUpcomingBill.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { dueDate, reminderDate, title, description, amount, status } = body;

    // Validate that reminderDate is before dueDate
    if (new Date(reminderDate) >= new Date(dueDate)) {
      return JsonOne(400, t('backend.upcomingBill.reminderDateBeforeDue'), false);
    }

    const existingUpcomingBill = await UpcomingBill.findOne({
      _id: upcomingBillId,
      user: userId,
      isDeleted: false,
    });

    if (!existingUpcomingBill) {
      return JsonOne(404, t('backend.upcomingBill.notFound'), false);
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

    return JsonOne(200, t('backend.upcomingBill.updatedSuccessfully'), true, {
      upcomingBill: updatedUpcomingBill,
    });
  });
}