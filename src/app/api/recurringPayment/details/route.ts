import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import {
  setParamValue,
  convertAmountsToUserCurrency,
  parsePaginationParams,
  createPaginationPipeline,
} from "@/app/backend/utils/PaginationUtils";
import { advanceOverdueRecurringPayments } from "@/app/backend/utils/advanceRecurring";

export async function GET(request: Request) {
  return await withAuthAndDB(async (_session, userId, t) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const status = setParamValue(url, "status");
    const search = setParamValue(url, "search") || "";
    const dateFrom = setParamValue(url, "dateFrom");
    const dateTo = setParamValue(url, "dateTo");
    const minAmount = setParamValue(url, "minAmount");
    const maxAmount = setParamValue(url, "maxAmount");

    await advanceOverdueRecurringPayments(userId);

    const user = await User.findById(userIdObj);
    if (!user) return JsonAll(404, t("backend.api.userNotFound"), false, [], {});

    const { page, limit, sortBy, sortOrder, skip } = parsePaginationParams(
      url,
      "nextDueDate"
    );

    const matchStage: Record<string, unknown> = {
      user: userIdObj,
      isDeleted: false,
    };

    if (status && status !== "All") {
      matchStage.status = status;
    }

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      const nextDueDate: Record<string, Date> = {};
      if (dateFrom) {
        nextDueDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        nextDueDate.$lte = to;
      }
      matchStage.nextDueDate = nextDueDate;
    }

    if (minAmount || maxAmount) {
      const amount: { $gte?: number; $lte?: number } = {};
      if (minAmount) {
        amount.$gte = await convertToINR(
          parseFloat(minAmount),
          user.currency,
          t
        );
      }
      if (maxAmount) {
        amount.$lte = await convertToINR(
          parseFloat(maxAmount),
          user.currency,
          t
        );
      }
      matchStage.amount = amount;
    }

    const projectFields = {
      _id: 1,
      title: 1,
      description: 1,
      amount: 1,
      nextDueDate: 1,
      reminderDate: 1,
      frequency: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const pipeline = createPaginationPipeline(
      matchStage,
      projectFields,
      sortBy,
      sortOrder,
      skip,
      limit
    );

    const result = await RecurringPayment.aggregate(pipeline);

    const rawRecurringPayments = result[0]?.data || [];
    const totalRecurringPayments = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalRecurringPayments / limit);

    const recurringPayments = await convertAmountsToUserCurrency(
      rawRecurringPayments,
      user.currency,
      t
    );

    return JsonAll(200, t("backend.api.success"), true, recurringPayments, {
      currentPage: page,
      totalPages,
      totalRecurringPayments,
      limit,
    });
  });
}
