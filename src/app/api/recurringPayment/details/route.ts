import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";
import { setParamValue, convertAmountsToUserCurrency, parsePaginationParams, createPaginationPipeline } from "@/app/backend/utils/PaginationUtils";


export async function GET(request: Request) {
    return await withAuthAndDB(async (session, userId, t) => {
      const userIdObj = new Types.ObjectId(userId);
      const url = new URL(request.url);
      const status = setParamValue(url, "status");

      // Get user's currency
      const user = await User.findById(userIdObj);
      if (!user) return JsonAll(404, t("backend.api.userNotFound"), false, [], {});

     const { page, limit, sortBy, sortOrder, skip } = parsePaginationParams(url, "nextDueDate");

     const matchStage: { user: Types.ObjectId; isDeleted: boolean; status?: string } = {
       user: userIdObj,
       isDeleted: false
     };
     if (status && status !== "All") matchStage.status = status;

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

     const pipeline = createPaginationPipeline(matchStage, projectFields, sortBy, sortOrder, skip, limit);

     const result = await RecurringPayment.aggregate(pipeline);

     const rawRecurringPayments = result[0]?.data || [];
     const totalRecurringPayments = result[0]?.totalCount[0]?.count || 0;
     const totalPages = Math.ceil(totalRecurringPayments / limit);

     // Convert amounts from INR to user's currency
     const recurringPayments = await convertAmountsToUserCurrency(rawRecurringPayments, user.currency, t);

     return JsonAll(200, t("backend.api.success"), true, recurringPayments, {
       currentPage: page,
       totalPages,
       totalRecurringPayments,
       limit,
     });
   });
 }