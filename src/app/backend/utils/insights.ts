import { Types } from "mongoose";
import {
  startOfMonth as startOfMonthFn,
  endOfMonth as endOfMonthFn,
} from "date-fns";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { PipelineStage } from "mongoose";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";
import { getTranslations } from "next-intl/server";
import { Session } from "@/app/types/appTypes";

export async function getDailyAverageInsight(
  session: Session,
  userId: string
): Promise<string> {
  const t = await getTranslations();

  const userIdObj = new Types.ObjectId(userId); // Convert to ObjectId

  const user = await User.findById(userIdObj); // Get user details
  if (!user) throw new Error(t("backend.api.userNotFound")); // User not found

  const now = new Date(); // Current date
  const startOfMonthDate = startOfMonthFn(now); // Start of current month
  const daysElapsed = now.getDate(); // Days passed this month

  // Aggregate total expenses from start of month
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userIdObj,
        isDeleted: false,
        type: "Expense",
        date: { $gte: startOfMonthDate },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const sum = result[0]?.total || 0; // Total expenses
  const average = daysElapsed > 0 ? sum / daysElapsed : 0; // Daily average
  const converted = await convertFromINR(average, user.currency, t); // Convert currency

  // Build insight message
  return `${t("backend.insights.dailyAverageExpense")} ${
    user.currency
  } ${converted.toFixed(2)}.`;
}

export async function getTopCategoryInsight(
  session: Session,
  userId: string
): Promise<string> {
  const t = await getTranslations();
  const userIdObj = new Types.ObjectId(userId);

  // Get user's currency
  const user = await User.findById(userIdObj);
  if (!user) throw new Error(t("backend.api.userNotFound"));

  // Calculate current month date range
  const now = new Date();
  const startOfMonth = startOfMonthFn(now);
  const endOfMonth = endOfMonthFn(now);

  const matchStage = {
    user: userIdObj,
    isDeleted: false,
    type: "Expense",
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  };

  const pipeline: PipelineStage[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category.name",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ];

  const result = await Transaction.aggregate(pipeline);

  if (result.length > 0) {
    const data = result[0];
    // Convert total from INR to user's currency
    const convertedTotal = await convertFromINR(
      data.total,
      user.currency,
      t as (key: string) => string
    );
    return `${t("backend.insights.topCategory")} ${data._id} with ${user.currency} ${convertedTotal.toFixed(2)}.`;
  } else {
    return t("backend.insights.noExpenses");
  }
}

export async function getTotalExpenseInsight(
  session: Session,
  userId: string
): Promise<string> {
  const t = await getTranslations(); // Load translations
  const userIdObj = new Types.ObjectId(userId); // Convert to ObjectId

  const user = await User.findById(userIdObj); // Get user details
  if (!user) throw new Error(t("backend.api.userNotFound")); // User not found

  const now = new Date(); // Current date
  const startOfMonthDate = startOfMonthFn(now); // Start of current month

  // Aggregate total expenses from start of month
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userIdObj,
        isDeleted: false,
        type: "Expense",
        date: { $gte: startOfMonthDate },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const sum = result[0]?.total || 0; // Total expenses
  const converted = await convertFromINR(sum, user.currency, t); // Convert currency

  // Build insight message
  return `${t("backend.insights.totalExpenses")} ${
    user.currency
  } ${converted.toFixed(2)}.`;
}

export async function getTotalIncomeInsight(
  session: Session,
  userId: string
): Promise<string> {
  const t = await getTranslations(); // Load translations
  const userIdObj = new Types.ObjectId(userId); // Convert to ObjectId

  const user = await User.findById(userIdObj); // Get user details
  if (!user) throw new Error("User not found"); // User not found

  const now = new Date(); // Current date
  const startOfMonthDate = startOfMonthFn(now); // Start of current month

  // Aggregate total income from start of month
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userIdObj,
        isDeleted: false,
        type: "Income",
        date: { $gte: startOfMonthDate },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const sum = result[0]?.total || 0; // Total income
  const converted = await convertFromINR(sum, user.currency, t); // Convert currency

  // Build insight message
  return `${t("backend.insights.totalIncome")} ${
    user.currency
  } ${converted.toFixed(2)}.`;
}

export async function getSavingsInsight(
  session: Session,
  userId: string
): Promise<string> {
  const t = await getTranslations(); // Load translations
  const userIdObj = new Types.ObjectId(userId); // Convert to ObjectId

  const user = await User.findById(userIdObj); // Get user details
  if (!user) throw new Error(t("backend.api.userNotFound")); // User not found

  const now = new Date(); // Current date
  const startOfMonthDate = startOfMonthFn(now); // Start of current month

  // Aggregate total income and expense from start of month
  const [incomeResult, expenseResult] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          user: userIdObj,
          isDeleted: false,
          type: "Income",
          date: { $gte: startOfMonthDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: userIdObj,
          isDeleted: false,
          type: "Expense",
          date: { $gte: startOfMonthDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const income = incomeResult[0]?.total || 0;
  const expense = expenseResult[0]?.total || 0;
  const savings = income - expense;

  const converted = await convertFromINR(Math.abs(savings), user.currency, t); // Convert absolute value

  // Build insight message
  if (savings > 0) {
    return `${t("backend.insights.saved")} ${
      user.currency
    } ${converted.toFixed(2)}.`;
  } else if (savings < 0) {
    return `${t("backend.insights.overspent")} ${
      user.currency
    } ${converted.toFixed(2)}.`;
  } else {
    return t("backend.insights.brokenEven");
  }
}
