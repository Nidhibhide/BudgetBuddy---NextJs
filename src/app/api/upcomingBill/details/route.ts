import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import User from "@/app/backend/models/user";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";
import {
  convertToINR,
  convertFromINR,
} from "@/app/backend/utils/currencyConverter";
import {
  setParamValue,
  convertAmountsToUserCurrency,
  parsePaginationParams,
  createPaginationPipeline,
} from "@/app/backend/utils/PaginationUtils";

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

    const user = await User.findById(userIdObj);
    if (!user) return JsonAll(404, "User not found", false, [], {});

    const { page, limit, sortBy, sortOrder, skip } = parsePaginationParams(
      url,
      "dueDate"
    );

    const matchStage: Record<string, unknown> = {
      user: userIdObj,
      isDeleted: false,
    };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (status && status !== "All") {
      if (status === "Paid") {
        matchStage.status = "Paid";
      } else if (status === "Due Today") {
        matchStage.status = { $ne: "Paid" };
        matchStage.dueDate = { $gte: todayStart, $lte: todayEnd };
      } else if (status === "Overdue") {
        matchStage.status = { $ne: "Paid" };
        matchStage.dueDate = { $lt: todayStart };
      } else if (status === "Upcoming") {
        matchStage.status = { $ne: "Paid" };
        matchStage.dueDate = { $gt: todayEnd };
      }
    }

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      const existingDue =
        typeof matchStage.dueDate === "object" && matchStage.dueDate
          ? { ...(matchStage.dueDate as Record<string, Date>) }
          : {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        existingDue.$gte =
          existingDue.$gte && existingDue.$gte > from
            ? existingDue.$gte
            : from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        existingDue.$lte =
          existingDue.$lte && existingDue.$lte < to ? existingDue.$lte : to;
      }
      matchStage.dueDate = existingDue;
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
      dueDate: 1,
      reminderDate: 1,
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

    const [result, unpaidSumResult] = await Promise.all([
      UpcomingBill.aggregate(pipeline),
      UpcomingBill.aggregate([
        {
          $match: {
            user: userIdObj,
            isDeleted: false,
            status: { $ne: "Paid" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const rawUpcomingBills = result[0]?.data || [];
    const totalUpcomingBills = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalUpcomingBills / limit);

    const upcomingBills = await convertAmountsToUserCurrency(
      rawUpcomingBills,
      user.currency,
      t
    );

    const unpaidTotalInr = unpaidSumResult[0]?.total || 0;
    const totalUnpaidAmount = await convertFromINR(
      unpaidTotalInr,
      user.currency,
      t
    );

    return JsonAll(200, "Fetched successfully", true, upcomingBills, {
      currentPage: page,
      totalPages,
      totalUpcomingBills,
      totalUnpaidAmount,
      limit,
    });
  });
}
