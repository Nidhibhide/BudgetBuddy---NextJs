import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import Category from "@/app/backend/models/category";
import User from "@/app/backend/models/user";
import { UpdateTransaction } from "@/app/backend/validations/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR, convertFromINR } from "@/app/backend/utils/currencyConverter";
import { Transaction as TransactionType } from "@/app/types/appTypes";
import { checkLimitForEdit } from "@/app/backend/utils/transactionChecks";
import { getT } from "@/app/backend/utils/getTranslations";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const t = await getT();
    const url = new URL(request.url);
    const transactionId = url.searchParams.get("id");

    if (!transactionId) {
      return JsonOne(400, t('backend.transaction.idRequired'), false);
    }

    const body = await request.json();
    const { error } = UpdateTransaction.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { date, title, description, category, amount } = body;

    // Find the existing transaction and user in parallel
    const [existingTransaction, user] = await Promise.all([
      Transaction.findOne({
        _id: transactionId,
        user: userId,
        isDeleted: false,
      }),
      User.findById(userId),
    ]);

    if (!existingTransaction) {
      return JsonOne(404, t('backend.transaction.notFound'), false);
    }

    if (!user) return JsonOne(404, t('backend.user.notFound'), false);

    const updateData: Partial<TransactionType> = {};
    let balanceAdjustment = 0;

    // Handle category update
    if (category) {
      const categoryDoc = await Category.findOne({
        name: category,
        user: userId,
        type: existingTransaction.type,
        isArchived: false,
      });

      if (!categoryDoc) {
        return JsonOne(400, t('backend.category.notFound'), false);
      }
      updateData.category = categoryDoc._id;
    }

    // Handle amount update
    if (amount !== undefined) {
      const newAmountInINR = await convertToINR(amount, user.currency, t);
      balanceAdjustment = newAmountInINR - existingTransaction.amount;
      updateData.amount = newAmountInINR;
    }

    // Handle other fields
    if (date) updateData.date = new Date(date);
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // Check budget limit or goal if amount is increasing
    if (balanceAdjustment > 0) {
      const categoryId = updateData.category || existingTransaction.category;
      const limitCheck = await checkLimitForEdit(
        categoryId.toString(),
        userId,
        existingTransaction.type,
        balanceAdjustment,
        user.currency,
        t
      );
      if (!limitCheck.success) {
        return JsonOne(400, limitCheck.message || t('backend.transaction.limitCheckFailed'), false);
      }
    }

    // Update balance if amount changed
    if (balanceAdjustment !== 0) {
      const balanceUpdate = await updateUserBalance(userId, balanceAdjustment, existingTransaction.type, t);
      if (!balanceUpdate.success) {
        return JsonOne(400, balanceUpdate.message || t('backend.transaction.balanceUpdateFailed'), false);
      }
    }

    // Update the transaction and convert amount back to user's currency in parallel
    const [updatedTransaction, responseAmount] = await Promise.all([
      Transaction.findByIdAndUpdate(transactionId, updateData, { new: true }),
      amount !== undefined ? convertFromINR(updateData.amount!, user.currency, t) : convertFromINR(existingTransaction.amount, user.currency, t),
    ]);

    return JsonOne(200, t('backend.transaction.updatedSuccessfully'), true, {
      transaction: {
        ...updatedTransaction.toObject(),
        amount: responseAmount,
      },
    });
  });
}