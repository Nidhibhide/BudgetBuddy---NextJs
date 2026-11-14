import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    if (!upcomingBillId || !Types.ObjectId.isValid(upcomingBillId)) {
      return JsonOne(400, "Invalid upcoming bill id", false);
    }

    const updated = await UpcomingBill.findOneAndUpdate(
      {
        _id: upcomingBillId,
        user: userId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!updated) {
      return JsonOne(404, "Upcoming bill not found", false);
    }

    return JsonOne(200, "Upcoming bill deleted", true);
  });
}
