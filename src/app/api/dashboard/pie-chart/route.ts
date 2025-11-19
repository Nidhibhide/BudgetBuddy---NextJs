import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import { startOfMonth as startOfMonthFn, endOfMonth as endOfMonthFn } from 'date-fns';
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

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonOne(404, t('backend.user.notFound'), false);

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
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$total" },
          categories: {
            $push: {
              category: "$_id",
              total: "$total",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalExpenses: 1,
          categories: {
            $map: {
              input: "$categories",
              as: "cat",
              in: {
                category: "$$cat.category",
                total: "$$cat.total",
                percentage: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$$cat.total", "$totalExpenses"] }, 100],
                    },
                    2,
                  ],
                },
              },
            },
          },
        },
      },
    ];

    const result = await Transaction.aggregate(pipeline);

    if (result.length === 0) {
      return JsonOne(200, t('backend.transaction.totalsFetchedSuccessfully'), true, {
        totalExpenses: 0,
        categories: [],
      });
    }

    const data = result[0];

    // Convert totals from INR to user's currency
    data.totalExpenses = await convertFromINR(data.totalExpenses, user.currency, t as (key: string) => string);
    for (const cat of data.categories) {
      cat.total = await convertFromINR(cat.total, user.currency, t as (key: string) => string);
    }

    return JsonOne(200, t('backend.transaction.totalsFetchedSuccessfully'), true, data);
  });
}