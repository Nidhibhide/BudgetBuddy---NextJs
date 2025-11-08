import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    if (!upcomingBillId) {
      return JsonOne(400, "Upcoming Bill ID is required", false);
    }

    // Find the upcoming bill
    const upcomingBill = await UpcomingBill.findOne({
      _id: upcomingBillId,
      user: userId,
      isDeleted: false,
    });

    if (!upcomingBill) {
      return JsonOne(404, "Upcoming Bill not found", false);
    }

    // Soft delete the upcoming bill
    upcomingBill.isDeleted = true;
    await upcomingBill.save();

    return JsonOne(200, "Upcoming Bill deleted successfully", true);
  });
}