import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import User from "@/app/backend/models/user";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (session, userId, t) => {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get("id");



    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
      isDeleted: false,
    });

    if (!transaction) {
      return JsonOne(404, t("backend.api.transactionNotFound"), false);
    }

    // Get user's currency
    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, t("backend.api.userNotFound"), false);
    }

    // Convert amount back to INR for balance reversal
    const amountInINR = await convertToINR(transaction.amount, user.currency, t);

    // Reverse the balance update
    const reverseType = transaction.type === "Income" ? "Expense" : "Income";
    const balanceUpdate = await updateUserBalance(userId, amountInINR, reverseType, t);
    if (!balanceUpdate.success) {
      return JsonOne(400, balanceUpdate.message || t("backend.api.balanceUpdateFailed"), false);
    }

    // Soft delete the transaction
    transaction.isDeleted = true;
    await transaction.save();

    return JsonOne(200, t("backend.api.success"), true);
  });
}