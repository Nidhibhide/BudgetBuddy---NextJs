import Category from "@/app/backend/models/category";
import Transaction from "@/app/backend/models/transaction";
import { LimitCheckResult } from "@/app/types/appTypes";

export async function checkLimitForCreate(
  categoryId: string,
  userId: string,
  type: "Expense" | "Income",
  amountInINR: number,
  _userCurrency: string
): Promise<LimitCheckResult> {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // budgetLimit / goal are stored in INR (same as transactions)
    if (type === "Expense" && category.budgetLimit > 0) {
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalSpent = 0;
      for (const transaction of allTransactions) {
        if (transaction.type === "Expense") {
          totalSpent += transaction.amount;
        }
      }
      if (totalSpent + amountInINR > category.budgetLimit) {
        return {
          success: false,
          message: "Adding this expense would exceed the budget limit",
        };
      }
    } else if (type === "Income" && category.goal > 0) {
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalIncome = 0;
      for (const transaction of allTransactions) {
        if (transaction.type === "Income") {
          totalIncome += transaction.amount;
        }
      }
      if (totalIncome + amountInINR > category.goal) {
        return {
          success: false,
          message: "Adding this income would exceed the goal",
        };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        type === "Expense"
          ? "Error checking budget limit"
          : "Error checking goal",
    };
  }
}


export async function checkLimitForEdit(
  categoryId: string,
  userId: string,
  type: "Expense" | "Income",
  balanceAdjustment: number,
  _userCurrency: string
): Promise<LimitCheckResult> {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // budgetLimit / goal are stored in INR (same as transactions)
    if (
      type === "Expense" &&
      category.budgetLimit > 0 &&
      balanceAdjustment > 0
    ) {
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalSpent = 0;
      for (const transaction of allTransactions) {
        if (transaction.type === "Expense") {
          totalSpent += transaction.amount;
        }
      }
      if (totalSpent + balanceAdjustment > category.budgetLimit) {
        return {
          success: false,
          message: "Editing this expense would exceed the budget limit",
        };
      }
    } else if (
      type === "Income" &&
      category.goal > 0 &&
      balanceAdjustment > 0
    ) {
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalIncome = 0;
      for (const transaction of allTransactions) {
        if (transaction.type === "Income") {
          totalIncome += transaction.amount;
        }
      }
      if (totalIncome + balanceAdjustment > category.goal) {
        return {
          success: false,
          message: "Editing this income would exceed the goal",
        };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        type === "Expense"
          ? "Error checking budget limit"
          : "Error checking goal",
    };
  }
}
