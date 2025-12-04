import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  return await withAuthAndDB(async (session, userId, t) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const now = new Date();
    const month = parseInt(
      url.searchParams.get("month") ?? (now.getMonth() + 1).toString()
    );
    const year = parseInt(
      url.searchParams.get("year") ?? now.getFullYear().toString()
    );

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonOne(404, t("backend.api.userNotFound"), false);

    const date = new Date(year, month - 1, 1);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          user: userIdObj,
          isDeleted: false,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          income: {
            $sum: {
              $cond: {
                if: { $eq: ["$type", "Income"] },
                then: "$amount",
                else: 0,
              },
            },
          },
          expense: {
            $sum: {
              $cond: {
                if: { $eq: ["$type", "Expense"] },
                then: "$amount",
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          income: 1,
          expense: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    const dailyData = await Transaction.aggregate(pipeline);

    // Convert amounts from INR to user's currency
    await Promise.all(
      dailyData.map(async (day) => {
        day.income = await convertFromINR(day.income, user.currency, t);
        day.expense = await convertFromINR(day.expense, user.currency, t);
      })
    );

    const result = {
      days: dailyData.map(({ date, income, expense }) => ({
        date,
        income,
        expense,
      })),
    };

    return JsonOne(
      200,
      t("backend.api.success"),
      true,
      result
    );
  });
}
