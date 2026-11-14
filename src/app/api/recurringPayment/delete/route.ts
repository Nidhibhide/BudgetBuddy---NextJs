import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    if (!recurringPaymentId || !Types.ObjectId.isValid(recurringPaymentId)) {
      return JsonOne(400, "Invalid recurring payment id", false);
    }

    const updated = await RecurringPayment.findOneAndUpdate(
      {
        _id: recurringPaymentId,
        user: userId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!updated) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    return JsonOne(200, "Recurring payment deleted", true);
  });
}
