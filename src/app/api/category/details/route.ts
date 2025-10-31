import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Category from "@/app/backend/models/category";
import { JsonOne, JsonAll } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return JsonOne(401, "Unauthorized", false);

    const userId = new Types.ObjectId(session.user.id);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;
    const matchStage = { user: userId, type, isArchived: false };

    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          data: [
            { $project: { _id: 1, name: 1, type: 1, icon: 1 } },
            { $sort: { name: 1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Category.aggregate(pipeline as PipelineStage[]);

    const categories = result[0]?.data || [];
    const totalCategories = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCategories / limit);

    return JsonAll(200, "Fetched successfully", true, categories, {
      currentPage: page,
      totalPages,
      totalCategories,
      limit,
    });
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    return JsonOne(500, "Internal Server Error", false);
  }
}
