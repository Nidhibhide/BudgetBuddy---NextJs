import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import {
  getDailyAverageInsight,
  getTopCategoryInsight,
  getTotalExpenseInsight,
  getTotalIncomeInsight,
  getSavingsInsight
} from "@/app/backend/utils/insights";

export async function GET() {
  return await withAuthAndDB(async (session, userId) => {
    try {
      // Fetch all insights concurrently
      const [dailyAverage, topCategory, totalExpense, totalIncome, savings] = await Promise.all([
        getDailyAverageInsight(session, userId),
        getTopCategoryInsight(session, userId),
        getTotalExpenseInsight(session, userId),
        getTotalIncomeInsight(session, userId),
        getSavingsInsight(session, userId),
      ]);

      const insights = [dailyAverage, topCategory, totalExpense, totalIncome, savings];

      return JsonOne(200, "Fetched successfully", true, { insights });
    } catch (error) {
      console.error("Error Occurred:", error);
      return JsonOne(500, "Error occurred", false);
    }
  });
}