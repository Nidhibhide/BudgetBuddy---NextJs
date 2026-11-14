import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const upcomingBillId = url.searchParams.get("id");

    if (!upcomingBillId) {
      return JsonOne(400, "Bill id is required", false);
    }

    let requestedStatus: string | undefined;
    try {
      const body = await request.json();
      requestedStatus = body?.status;
    } catch {
      requestedStatus = undefined;
    }

    if (requestedStatus && requestedStatus !== "Paid") {
      return JsonOne(
        400,
        requestedStatus === "Unpaid"
          ? "Paid bill cannot be marked as unpaid"
          : "Status must be Paid",
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

    if (existingUpcomingBill.status === "Paid") {
      return JsonOne(200, "Bill already marked as paid", true, {
        upcomingBill: existingUpcomingBill,
      });
    }

    existingUpcomingBill.status = "Paid";
    await existingUpcomingBill.save({ validateModifiedOnly: true });

    return JsonOne(200, "Bill marked as paid", true, {
      upcomingBill: existingUpcomingBill,
    });
  });
}
