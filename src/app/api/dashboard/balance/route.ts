import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";

export async function GET() {
  return await withAuthAndDB(async (session, userId, t) => {
    const user = await User.findById(userId);
    if (!user) return JsonOne(404, t("backend.api.userNotFound"), false);

    const balance = await convertFromINR(user.totalBalance, user.currency, t);

    return JsonOne(200, t("backend.api.success"), true, { balance });
  });
}