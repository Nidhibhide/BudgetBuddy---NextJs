import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { advanceOverdueRecurringPayments } from "@/app/backend/utils/advanceRecurring";
import { convertFromINR } from "@/app/backend/utils/currencyConverter";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET() {
  return await withAuthAndDB(async (_session, userId) => {
    await advanceOverdueRecurringPayments(userId);

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }
    const currency = user.currency || "INR";

    const { start, end } = getTodayRange();

    const [bills, payments] = await Promise.all([
      UpcomingBill.find({
        user: userId,
        isDeleted: false,
        status: "Unpaid",
        reminderDate: { $lte: end },
        dueDate: { $gte: start },
      })
        .select("title amount dueDate reminderDate")
        .sort({ dueDate: 1 })
        .lean(),
      RecurringPayment.find({
        user: userId,
        isDeleted: false,
        status: "Active",
        reminderDate: { $lte: end },
        nextDueDate: { $gte: start },
      })
        .select("title amount nextDueDate reminderDate")
        .sort({ nextDueDate: 1 })
        .lean(),
    ]);

    const billReminders = await Promise.all(
      bills.map(async (bill) => ({
        id: String(bill._id),
        title: bill.title,
        amount: await convertFromINR(bill.amount, currency),
        dueDate: bill.dueDate,
        type: "bill" as const,
      }))
    );

    const paymentReminders = await Promise.all(
      payments.map(async (payment) => ({
        id: String(payment._id),
        title: payment.title,
        amount: await convertFromINR(payment.amount, currency),
        dueDate: payment.nextDueDate,
        type: "payment" as const,
      }))
    );

    const reminders = [...billReminders, ...paymentReminders].sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return JsonOne(200, "Success", true, {
      count: reminders.length,
      reminders,
    });
  });
}
