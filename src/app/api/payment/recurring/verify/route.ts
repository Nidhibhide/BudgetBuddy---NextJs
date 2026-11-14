import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { verifyPaymentSignature } from "@/app/backend/utils/razorpay";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { getOrCreateBillsCategory } from "@/app/backend/utils/billsCategory";
import {
  daysBetween,
  parseLocalDate,
  subtractDays,
} from "@/app/lib/dateUtils";
import { addFrequency } from "@/app/backend/utils/advanceRecurring";

function advanceAfterPayment(
  nextDueDate: Date,
  reminderDate: Date,
  frequency: string
) {
  const today = parseLocalDate(new Date());
  const remindDays = Math.max(0, daysBetween(reminderDate, nextDueDate));

  // Pay current occurrence → move at least one cycle forward
  let next = addFrequency(nextDueDate, frequency);
  while (next.getTime() < today.getTime()) {
    next = addFrequency(next, frequency);
  }

  let reminder = subtractDays(next, remindDays);
  if (reminder.getTime() < today.getTime()) {
    reminder = today;
  }

  return { nextDueDate: next, reminderDate: reminder };
}

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const {
      recurringPaymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body || {};

    if (
      !recurringPaymentId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return JsonOne(400, "Payment details are required", false);
    }

    const payment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!payment) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    // Same payment already processed → idempotent success
    if (payment.lastRazorpayPaymentId === razorpay_payment_id) {
      return JsonOne(200, "Payment already processed", true, {
        recurringPayment: payment,
        alreadyProcessed: true,
      });
    }

    if (
      payment.razorpayOrderId &&
      payment.razorpayOrderId !== razorpay_order_id
    ) {
      return JsonOne(400, "Order does not match this payment", false);
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return JsonOne(400, "Payment verification failed", false);
    }

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    const category = await getOrCreateBillsCategory(userId);
    // Amount is already stored in INR
    const amountInINR = payment.amount;

    const balanceUpdate = await updateUserBalance(
      userId,
      amountInINR,
      "Expense"
    );
    if (!balanceUpdate.success) {
      const freshUser = await User.findById(userId);
      if (freshUser) {
        freshUser.totalBalance = Math.max(
          0,
          (freshUser.totalBalance || 0) - amountInINR
        );
        await freshUser.save();
      }
    }

    const expense = await Transaction.create({
      title: payment.title,
      amount: amountInINR,
      type: "Expense",
      category: category._id,
      date: new Date(),
      description:
        payment.description ||
        `Recurring payment via Razorpay (${razorpay_payment_id})`,
      user: userId,
    });

    const advanced = advanceAfterPayment(
      payment.nextDueDate,
      payment.reminderDate,
      payment.frequency
    );

    payment.nextDueDate = advanced.nextDueDate;
    payment.reminderDate = advanced.reminderDate;
    payment.reminderEmailSent = false;
    payment.razorpayOrderId = null;
    payment.lastRazorpayPaymentId = razorpay_payment_id;
    // stays Active
    await payment.save({ validateModifiedOnly: true });

    return JsonOne(
      200,
      "Payment successful. Next due date updated.",
      true,
      {
        recurringPayment: payment,
        expenseTransactionId: expense._id,
      }
    );
  });
}
