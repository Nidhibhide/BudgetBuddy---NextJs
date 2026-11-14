import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    if (!recurringPaymentId) {
      return JsonOne(400, "Payment id is required", false);
    }

    const body = await request.json();
    const status = body?.status;

    if (status !== "Active" && status !== "Inactive") {
      return JsonOne(400, "Status must be Active or Inactive", false);
    }

    const existingRecurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!existingRecurringPayment) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    existingRecurringPayment.status = status;
    await existingRecurringPayment.save({ validateModifiedOnly: true });

    return JsonOne(200, `Payment set to ${status}`, true, {
      recurringPayment: existingRecurringPayment,
    });
  });
}
