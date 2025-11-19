import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";
import { getT } from "@/app/backend/utils/getTranslations";

export async function GET() {
  return await withAuthAndDB(async (session, userId) => {
    const t = await getT();
    const userIdObj = new Types.ObjectId(userId);

    const user = await User.findById(userIdObj);
    if (!user) return JsonOne(404, t('backend.user.notFound'), false);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          user: userIdObj,
          isDeleted: false,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          income: {
            $sum: { $cond: [{ $eq: ["$_id.type", "Income"] }, "$total", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$_id.type", "Expense"] }, "$total", 0] },
          },
        },
      },
      {
        $project: { _id: 0, month: "$_id", income: 1, expense: 1 },
      },
      { $sort: { month: 1 } },
    ];

    const result = await Transaction.aggregate(pipeline);

    for (const item of result) {
      item.income = await convertFromINR(item.income, user.currency, t as (key: string) => string);
      item.expense = await convertFromINR(item.expense, user.currency, t as (key: string) => string);
    }

    return JsonOne(200, t('backend.transaction.totalsFetchedSuccessfully'), true, result);
  });
}