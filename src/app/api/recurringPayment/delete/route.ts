import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    if (!recurringPaymentId) {
      return JsonOne(400, "Recurring Payment ID is required", false);
    }

    // Find the recurring payment
    const recurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!recurringPayment) {
      return JsonOne(404, "Recurring Payment not found", false);
    }

    // Soft delete the recurring payment
    recurringPayment.isDeleted = true;
    await recurringPayment.save();

    return JsonOne(200, "Recurring Payment deleted successfully", true);
  });
}