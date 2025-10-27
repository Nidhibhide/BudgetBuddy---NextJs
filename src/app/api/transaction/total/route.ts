import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Transaction from "@/app/backend/models/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
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

    const matchStage: MatchStage = {
      user: userId,
      isDeleted: false,
      type: type || undefined,
      "category.name": category || undefined,
    };

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
        $group: {
          _id: { type: "$type", category: "$category.name" },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          category: "$_id.category",
          total: 1,
        },
      },
      { $sort: { type: 1, category: 1 } },
    ];

    const totals = await Transaction.aggregate(pipeline);

    return JsonOne(200, "Totals fetched successfully", true, totals);
  } catch (err) {
    console.error("❌ Error fetching totals:", err);
    return JsonOne(500, "Internal Server Error", false);
  }
}
