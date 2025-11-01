import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import Transaction from "@/app/backend/models/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import User from "@/app/backend/models/user";

export async function DELETE(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("id");
    const reassignCategoryId = url.searchParams.get("reassignCategoryId");

    if (!categoryId) {
      return JsonOne(400, "Category ID is required", false);
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      user: userId,
      isArchived: false,
    });

    if (!category) {
      return JsonOne(404, "Category not found", false);
    }

    // Get user's currency for balance updates
    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    // Find all associated transactions
    const associatedTransactions = await Transaction.find({
      category: categoryId,
      user: userId,
      isDeleted: false,
    });

    if (reassignCategoryId) {
      // Check if reassign category exists and has the same type
      const reassignCategory = await Category.findOne({
        _id: reassignCategoryId,
        user: userId,
        isArchived: false,
      });

      if (!reassignCategory) {
        return JsonOne(400, "Reassign category not found", false);
      }

      if (reassignCategory.type !== category.type) {
        return JsonOne(400, "Cannot reassign to a category of different type", false);
      }

      // Reassign transactions to the new category
      await Transaction.updateMany(
        { category: categoryId, user: userId, isDeleted: false },
        { category: reassignCategoryId }
      );
    } else {
      // Delete all associated transactions and update balances
      for (const transaction of associatedTransactions) {
        // Convert amount back to INR for balance reversal
        const amountInINR = await convertToINR(
          transaction.amount,
          user.currency
        );

        // Reverse the balance update
        const reverseType =
          transaction.type === "Income" ? "Expense" : "Income";
        const balanceUpdate = await updateUserBalance(
          userId,
          amountInINR,
          reverseType
        );
        if (!balanceUpdate.success) {
          return JsonOne(
            400,
            balanceUpdate.message || "Balance update failed",
            false
          );
        }

        // Soft delete the transaction
        transaction.isDeleted = true;
        await transaction.save();
      }
    }

    // Soft delete the category by archiving it
    await Category.updateOne({ _id: categoryId }, { isArchived: true });

    return JsonOne(200, "Category deleted successfully", true);
  });
}
