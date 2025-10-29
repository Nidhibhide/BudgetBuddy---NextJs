import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Transaction from "@/app/backend/models/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import User from "@/app/backend/models/user";

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return JsonOne(401, "Unauthorized", false);
    }

    const userId = session.user.id;
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
  } catch (error) {
    console.log("Error deleting transaction", error);
    return JsonOne(500, error instanceof Error ? error.message : "Error deleting transaction", false);
  }
}