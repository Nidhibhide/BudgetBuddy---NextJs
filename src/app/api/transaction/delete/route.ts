import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import User from "@/app/backend/models/user";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get("id");

    if (!transactionId) {
      return JsonOne(400, "Transaction ID is required", false);
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
      isDeleted: false,
    });

    if (!transaction) {
      return JsonOne(404, "Transaction not found", false);
    }

    // Get user's currency
    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    // Convert amount back to INR for balance reversal
    const amountInINR = await convertToINR(transaction.amount, user.currency);

    // Reverse the balance update
    const reverseType = transaction.type === "Income" ? "Expense" : "Income";
    const balanceUpdate = await updateUserBalance(userId, amountInINR, reverseType);
    if (!balanceUpdate.success) {
      return JsonOne(400, balanceUpdate.message || "Balance update failed", false);
    }

    // Soft delete the transaction
    transaction.isDeleted = true;
    await transaction.save();

    return JsonOne(200, "Transaction deleted successfully", true);
  });
}