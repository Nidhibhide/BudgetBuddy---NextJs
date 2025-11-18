import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getT } from "@/app/backend/utils/getTranslations";

export async function DELETE(request: Request) {
  const t = await getT();
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    if (!recurringPaymentId) {
      return JsonOne(400, t('backend.recurringPayment.idRequired'), false);
    }

    // Find the recurring payment
    const recurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!recurringPayment) {
      return JsonOne(404, t('backend.recurringPayment.notFound'), false);
    }

    // Soft delete the recurring payment
    recurringPayment.isDeleted = true;
    await recurringPayment.save();

    return JsonOne(200, t('backend.recurringPayment.deletedSuccessfully'), true);
  });
}