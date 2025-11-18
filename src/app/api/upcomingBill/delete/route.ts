import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getT } from "@/app/backend/utils/getTranslations";

export async function DELETE(request: Request) {
  const t = await getT();
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    if (!upcomingBillId) {
      return JsonOne(400, t('backend.upcomingBill.idRequired'), false);
    }

    // Find the upcoming bill
    const upcomingBill = await UpcomingBill.findOne({
      _id: upcomingBillId,
      user: userId,
      isDeleted: false,
    });

    if (!upcomingBill) {
      return JsonOne(404, t('backend.upcomingBill.notFound'), false);
    }

    // Soft delete the upcoming bill
    upcomingBill.isDeleted = true;
    await upcomingBill.save();

    return JsonOne(200, t('backend.upcomingBill.deletedSuccessfully'), true);
  });
}