import Category from "@/app/backend/models/category";
import Transaction from "@/app/backend/models/transaction";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import { LimitCheckResult } from "@/app/types/appTypes";


export async function checkLimitForCreate(
  categoryId: string,
  userId: string,
  type: "Expense" | "Income",
  amountInINR: number,
  userCurrency: string,
  t: (key: string) => string
): Promise<LimitCheckResult> {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return { success: false, message: t('backend.category.notFound') };
    }

    if (type === "Expense" && category.budgetLimit > 0) {
      const budgetLimitInINR = await convertToINR(
        category.budgetLimit,
        userCurrency,
        t
      );
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalSpent = 0;
      for (const t of allTransactions) {
        if (t.type === "Expense") {
          totalSpent += t.amount;
        }
      }
      if (totalSpent + amountInINR > budgetLimitInINR) {
        return {
          success: false,
          message: t('backend.transaction.addingExpenseExceedBudget'),
        };
      }
    } else if (type === "Income" && category.goal > 0) {
      const goalInINR = await convertToINR(category.goal, userCurrency, t);
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalIncome = 0;
      for (const t of allTransactions) {
        if (t.type === "Income") {
          totalIncome += t.amount;
        }
      }
      if (totalIncome + amountInINR > goalInINR) {
        return {
          success: false,
          message: t('backend.transaction.addingIncomeExceedGoal'),
        };
      }
    }

    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      message:
        type === "Expense"
          ? t('backend.transaction.errorCheckingBudgetLimit')
          : t('backend.transaction.errorCheckingGoal'),
    };
  }
}


export async function checkLimitForEdit(
  categoryId: string,
  userId: string,
  type: "Expense" | "Income",
  balanceAdjustment: number,
  userCurrency: string,
  t: (key: string) => string
): Promise<LimitCheckResult> {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return { success: false, message: t('backend.category.notFound') };
    }

    if (
      type === "Expense" &&
      category.budgetLimit > 0 &&
      balanceAdjustment > 0
    ) {
      const budgetLimitInINR = await convertToINR(
        category.budgetLimit,
        userCurrency,
        t
      );
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalSpent = 0;
      for (const t of allTransactions) {
        if (t.type === "Expense") {
          totalSpent += t.amount;
        }
      }
      if (totalSpent + balanceAdjustment > budgetLimitInINR) {
        return {
          success: false,
          message: t('backend.transaction.editingExpenseExceedBudget'),
        };
      }
    } else if (
      type === "Income" &&
      category.goal > 0 &&
      balanceAdjustment > 0
    ) {
      const goalInINR = await convertToINR(category.goal, userCurrency, t);
      const allTransactions = await Transaction.find({
        category: categoryId,
        user: userId,
        isDeleted: false,
      });

      let totalIncome = 0;
      for (const t of allTransactions) {
        if (t.type === "Income") {
          totalIncome += t.amount;
        }
      }
      if (totalIncome + balanceAdjustment > goalInINR) {
        return {
          success: false,
          message: t('backend.transaction.editingIncomeExceedGoal'),
        };
      }
    }

    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      message:
        type === "Expense"
          ? t('backend.transaction.errorCheckingBudgetLimit')
          : t('backend.transaction.errorCheckingGoal'),
    };
  }
}
