import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";
import {
  setParamValue,
  parsePaginationParams,
  createPaginationPipeline,
} from "@/app/backend/utils/PaginationUtils";
import { getT } from "@/app/backend/utils/getTranslations";

export async function GET(request: Request) {
  const t = await getT();
  return await withAuthAndDB(async (session, userId) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const type = setParamValue(url, "type");

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

    const categories = result[0]?.data || [];
    const totalCategories = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCategories / limit);

    return JsonAll(200, t('backend.category.fetchedSuccessfully'), true, categories, {
      currentPage: page,
      totalPages,
      totalCategories,
      limit,
    });
  });
}
