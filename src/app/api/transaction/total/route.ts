import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { MatchStage } from "@/app/types/appTypes";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";
import { getT } from "@/app/backend/utils/getTranslations";

export async function GET(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const t = await getT();
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonOne(404, t('backend.user.notFound'), false);

    const matchStage: MatchStage = {
      user: userIdObj,
      isDeleted: false,
      type: type || undefined,
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
          _id: { type: "$type", category: "$category.name" },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          total: { $sum: "$total" },
          categories: {
            $push: {
              category: "$_id.category",
              total: "$total",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          total: 1,
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
                      $multiply: [{ $divide: ["$$cat.total", "$total"] }, 100],
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

    const totals = await Transaction.aggregate(pipeline);

    // Convert totals from INR to user's currency
    for (const total of totals) {
      total.total = await convertFromINR(total.total, user.currency, t);
      for (const cat of total.categories) {
        cat.total = await convertFromINR(cat.total, user.currency, t);
      }
    }

    return JsonOne(200, t('backend.transaction.totalsFetchedSuccessfully'), true, totals);
  });
}
