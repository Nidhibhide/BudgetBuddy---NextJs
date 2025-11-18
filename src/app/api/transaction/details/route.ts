import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne, JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types, PipelineStage } from "mongoose";
import { MatchStage } from "@/app/types/appTypes";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import {
  setParamValue,
  parsePaginationParams,
  createPaginationPipeline,
  convertAmountsToUserCurrency,
} from "@/app/backend/utils/PaginationUtils";
import { getT } from "@/app/backend/utils/getTranslations";

export async function GET(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const t = await getT();
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);

    const type = setParamValue(url, "type");
    const category = setParamValue(url, "category");
    const { page, limit, sortBy, sortOrder, skip } = parsePaginationParams(
      url,
      "date"
    );

    const search = setParamValue(url, "search") || "";
    const dateFrom = setParamValue(url, "dateFrom");
    const dateTo = setParamValue(url, "dateTo");
    const minAmount = setParamValue(url, "minAmount");
    const maxAmount = setParamValue(url, "maxAmount");

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonOne(404, t('backend.user.notFound'), false);
    const matchStage: MatchStage = { user: userIdObj, isDeleted: false };
    if (type) matchStage.type = type;
    if (category && category !== "All") matchStage["category.name"] = category;
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      matchStage.date = {};
      if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
      if (dateTo) matchStage.date.$lte = new Date(dateTo);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      matchStage.amount = {};
      if (minAmount)
        matchStage.amount.$gte = await convertToINR(
          parseFloat(minAmount),
          user.currency,
          t
        );
      if (maxAmount)
        matchStage.amount.$lte = await convertToINR(
          parseFloat(maxAmount),
          user.currency,
          t
        );
    }

    const projectFields = {
      _id: 1,
      title: 1,
      amount: 1,
      type: 1,
      category: "$category.name",
      date: 1,
      description: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const pipeline = [
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
      ...createPaginationPipeline(
        {},
        projectFields,
        sortBy,
        sortOrder,
        skip,
        limit
      ).slice(1), // Skip the $match stage since we already have it
    ];

    const result = await Transaction.aggregate(pipeline as PipelineStage[]);

    const rawTransactions = result[0]?.data || [];
    const totalTransactions = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    // Convert amounts from INR to user's currency
    const transactions = await convertAmountsToUserCurrency(
      rawTransactions,
      user.currency,
      t
    );

    return JsonAll(200, t('backend.transaction.fetchedSuccessfully'), true, transactions, {
      currentPage: page,
      totalPages,
      totalTransactions,
      limit,
    });
  });
}
