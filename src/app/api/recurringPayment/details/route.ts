import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { PipelineStage, Types } from "mongoose";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";
import { RecurringPayment as RecurringPaymentType } from "@/app/types/appTypes";

export async function GET(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sortBy = url.searchParams.get("sortBy") || "nextDueDate";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonAll(404, "User not found", false, [], {});

    const skip = (page - 1) * limit;
    const matchStage: { user: Types.ObjectId; isDeleted: boolean; status?: string } = {
      user: userIdObj,
      isDeleted: false
    };
    if (status && status !== "All") matchStage.status = status;

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          data: [
            {
              $project: {
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

    const result = await RecurringPayment.aggregate(pipeline);

    const rawRecurringPayments = result[0]?.data || [];
    const totalRecurringPayments = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalRecurringPayments / limit);

    // Convert amounts from INR to user's currency
    const recurringPayments = await Promise.all(
      rawRecurringPayments.map(async (payment: RecurringPaymentType) => ({
        ...payment,
        amount: payment.amount ? await convertFromINR(payment.amount, user.currency) : 0,
      }))
    );

    return JsonAll(200, "Fetched successfully", true, recurringPayments, {
      currentPage: page,
      totalPages,
      totalRecurringPayments,
      limit,
    });
  });
}