import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { MatchStage } from "@/app/types/appTypes";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return JsonOne(401, "Unauthorized", false);

    const userId = new Types.ObjectId(session.user.id);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    // Get user's currency
    const user = await User.findById(userId);
    if (!user) return JsonOne(404, "User not found", false);

    const matchStage: MatchStage = {
      user: userId,
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
      total.total = await convertFromINR(total.total, user.currency);
      for (const cat of total.categories) {
        cat.total = await convertFromINR(cat.total, user.currency);
      }
    }

    return JsonOne(200, "Totals fetched successfully", true, totals);
  } catch (err) {
    console.error("❌ Error fetching totals:", err);
    return JsonOne(500, "Internal Server Error", false);
  }
}
