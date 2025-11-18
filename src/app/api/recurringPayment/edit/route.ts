import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import { UpdateRecurringPayment } from "@/app/backend/validations/recurringPayment";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getT } from "@/app/backend/utils/getTranslations";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const t = await getT();
    const url = new URL(request.url);
    const recurringPaymentId = url.searchParams.get("id");

    if (!recurringPaymentId) {
      return JsonOne(400, t('backend.recurringPayment.idRequired'), false);
    }

    const body = await request.json();
    const { error } = UpdateRecurringPayment.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { nextDueDate, reminderDate, title, description, amount, frequency, status } = body;

    // Validate that reminderDate is before nextDueDate
    if (new Date(reminderDate) >= new Date(nextDueDate)) {
      return JsonOne(400, t('backend.recurringPayment.reminderDateBeforeNextDue'), false);
    }

    const existingRecurringPayment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!existingRecurringPayment) {
      return JsonOne(404, t('backend.recurringPayment.notFound'), false);
    }

    const updateData = {
      title,
      description,
      amount,
      nextDueDate: new Date(nextDueDate),
      reminderDate: new Date(reminderDate),
      frequency,
      status,
    };

    const updatedRecurringPayment = await RecurringPayment.findByIdAndUpdate(
      recurringPaymentId,
      updateData,
      { new: true }
    );

    return JsonOne(200, t('backend.recurringPayment.updatedSuccessfully'), true, {
      recurringPayment: updatedRecurringPayment,
    });
  });
}