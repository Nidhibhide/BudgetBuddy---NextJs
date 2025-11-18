import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import User from "@/app/backend/models/user";
import { JsonAll } from "@/app/backend/utils/ApiResponse";
import { Types } from "mongoose";
import { setParamValue, convertAmountsToUserCurrency, parsePaginationParams, createPaginationPipeline } from "@/app/backend/utils/PaginationUtils";
import { getT } from "@/app/backend/utils/getTranslations";

export async function GET(request: Request) {
  const t = await getT();
  return await withAuthAndDB(async (session, userId) => {
    const userIdObj = new Types.ObjectId(userId);
    const url = new URL(request.url);
    const status = setParamValue(url, "status");

    // Get user's currency
    const user = await User.findById(userIdObj);
    if (!user) return JsonAll(404, t('backend.user.notFound'), false, [], {});

     const { page, limit, sortBy, sortOrder, skip } = parsePaginationParams(url, "dueDate");

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
       dueDate: 1,
       reminderDate: 1,
       status: 1,
       createdAt: 1,
       updatedAt: 1,
     };

     const pipeline = createPaginationPipeline(matchStage, projectFields, sortBy, sortOrder, skip, limit);

     const result = await UpcomingBill.aggregate(pipeline);

     const rawUpcomingBills = result[0]?.data || [];
     const totalUpcomingBills = result[0]?.totalCount[0]?.count || 0;
     const totalPages = Math.ceil(totalUpcomingBills / limit);

     // Convert amounts from INR to user's currency
     const upcomingBills = await convertAmountsToUserCurrency(rawUpcomingBills, user.currency, t);

     return JsonAll(200, t('backend.upcomingBill.fetchedSuccessfully'), true, upcomingBills, {
       currentPage: page,
       totalPages,
       totalUpcomingBills,
       limit,
     });
   });
 }