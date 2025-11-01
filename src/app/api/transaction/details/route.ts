import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne, JsonAll } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { MatchStage, Transaction as TransactionType } from "@/app/types/appTypes";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";

export async function GET(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sortBy = url.searchParams.get("sortBy") || "date";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonOne(404, "User not found", false);

    const skip = (page - 1) * limit;
    const matchStage: MatchStage = { user: userIdObj, isDeleted: false };
    if (type) matchStage.type = type;
    if (category && category !== "All" && category !== "undefined") matchStage["category.name"] = category;

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $match: matchStage },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 1,
                title: 1,
                amount: 1,
                type: 1,
                category: "$category.name",
                date: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
            { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Transaction.aggregate(pipeline);

    const rawTransactions = result[0]?.data || [];
    const totalTransactions = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    // Convert amounts from INR to user's currency
    const transactions = await Promise.all(
      rawTransactions.map(async (transaction: TransactionType) => ({
        ...transaction,
        amount: transaction.amount ? await convertFromINR(transaction.amount, user.currency) : 0,
      }))
    );

    return JsonAll(200, "Fetched successfully", true, transactions, {
      currentPage: page,
      totalPages,
      totalTransactions,
      limit,
    });
  });
}
