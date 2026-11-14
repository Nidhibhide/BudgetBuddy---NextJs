import dbConnect from "@/app/backend/config/MongoDB";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import {
  transporterFun,
  mailOptionsForReminder,
} from "@/app/backend/utils/sendEmail";
import { advanceOverdueRecurringPayments } from "@/app/backend/utils/advanceRecurring";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB");
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return JsonOne(401, "Unauthorized", false);
  }

  await dbConnect();

  try {
    const { start, end } = getTodayRange();
    const transporter = transporterFun();
    let sent = 0;

    const advanced = await advanceOverdueRecurringPayments();

    const bills = await UpcomingBill.find({
      isDeleted: false,
      status: "Unpaid",
      reminderEmailSent: { $ne: true },
      reminderDate: { $gte: start, $lte: end },
    });

    for (const bill of bills) {
      const user = await User.findById(bill.user);
      if (!user?.email) continue;

      await transporter.sendMail(
        mailOptionsForReminder({
          email: user.email,
          name: user.name,
          title: bill.title,
          amount: bill.amount,
          dueDate: formatDate(bill.dueDate),
          type: "bill",
        })
      );

      bill.reminderEmailSent = true;
      await bill.save();
      sent += 1;
    }

    const payments = await RecurringPayment.find({
      isDeleted: false,
      status: "Active",
      reminderEmailSent: { $ne: true },
      reminderDate: { $gte: start, $lte: end },
    });

    for (const payment of payments) {
      const user = await User.findById(payment.user);
      if (!user?.email) continue;

      await transporter.sendMail(
        mailOptionsForReminder({
          email: user.email,
          name: user.name,
          title: payment.title,
          amount: payment.amount,
          dueDate: formatDate(payment.nextDueDate),
          type: "payment",
        })
      );

      payment.reminderEmailSent = true;
      await payment.save();
      sent += 1;
    }

    return JsonOne(200, "Reminders processed", true, { sent, advanced });
  } catch (error) {
    console.error("Send reminders cron error:", error);
    return JsonOne(500, "Failed to send reminders", false);
  }
}
