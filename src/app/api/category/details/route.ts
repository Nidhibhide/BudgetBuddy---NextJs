import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import User from "@/app/backend/models/user";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";
import {
  setParamValue,
  parsePaginationParams,
  createPaginationPipeline,
} from "@/app/backend/utils/PaginationUtils";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";

export async function GET(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const type = setParamValue(url, "type");

    const user = await User.findById(userIdObj);
    if (!user) {
      return JsonAll(404, "User not found", false, [], {});
    }

    const { page, limit, skip } = parsePaginationParams(url);

    const matchStage = { user: userIdObj, type, isArchived: false };

    const projectFields = { _id: 1, name: 1, type: 1, budgetLimit: 1, goal: 1 };

    const pipeline = createPaginationPipeline(
      matchStage,
      projectFields,
      "name",
      "asc",
      skip,
      limit
    );

    const result = await Category.aggregate(pipeline);

    const rawCategories = result[0]?.data || [];
    const totalCategories = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCategories / limit);

    const currency = user.currency || "INR";
    const categories = await Promise.all(
      rawCategories.map(
        async (category: {
          budgetLimit?: number;
          goal?: number;
          [key: string]: unknown;
        }) => ({
          ...category,
          budgetLimit: await convertFromINR(category.budgetLimit || 0, currency),
          goal: await convertFromINR(category.goal || 0, currency),
        })
      )
    );

    return JsonAll(200, "Fetched successfully", true, categories, {
      currentPage: page,
      totalPages,
      totalCategories,
      limit,
    });
  });
}
