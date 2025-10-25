import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Transaction from "@/app/backend/models/transaction";
import { JsonOne, JsonAll } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { MatchStage } from "@/app/types/appTypes";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return JsonOne(401, "Unauthorized", false);

    const userId = new Types.ObjectId(session.user.id);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;
    const matchStage: MatchStage = { user: userId, isDeleted: false };
    if (type) matchStage.type = type;
    if (category && category !== "All") matchStage["category.name"] = category;

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
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Transaction.aggregate(pipeline);

    const transactions = result[0]?.data || [];
    const totalTransactions = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    return JsonAll(200, "Fetched successfully", true, transactions, {
      currentPage: page,
      totalPages,
      totalTransactions,
      limit,
    });
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    return JsonOne(500, "Internal Server Error", false);
  }
}
