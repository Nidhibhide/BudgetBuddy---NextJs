import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import RecurringPayment from "@/app/backend/models/recurringPayment";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import {
  getRazorpayInstance,
  toRazorpayAmount,
} from "@/app/backend/utils/razorpay";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const recurringPaymentId = body?.recurringPaymentId as string | undefined;

    if (!recurringPaymentId) {
      return JsonOne(400, "Recurring payment id is required", false);
    }

    const payment = await RecurringPayment.findOne({
      _id: recurringPaymentId,
      user: userId,
      isDeleted: false,
    });

    if (!payment) {
      return JsonOne(404, "Recurring payment not found", false);
    }

    if (payment.status !== "Active") {
      return JsonOne(400, "Only active recurring payments can be paid", false);
    }

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    // Online checkout is INR-only (Razorpay / product constraint)
    const currency = (user.currency || "INR").toUpperCase();
    if (currency !== "INR") {
      return JsonOne(
        400,
        "Online payments are available only in INR.",
        false
      );
    }

    const amountInSubunits = toRazorpayAmount(payment.amount);

    if (amountInSubunits < 100) {
      return JsonOne(400, "Minimum payment amount is 1.00", false);
    }

    try {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.create({
        amount: amountInSubunits,
        currency: "INR",
        receipt: `rec_${String(payment._id).slice(-8)}_${Date.now()}`.slice(
          0,
          40
        ),
        notes: {
          recurringPaymentId: String(payment._id),
          userId: String(userId),
          title: payment.title,
          type: "recurring",
        },
      });

      payment.razorpayOrderId = order.id;
      await payment.save({ validateModifiedOnly: true });

      return JsonOne(200, "Order created", true, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        recurringPaymentId: String(payment._id),
        paymentTitle: payment.title,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
      });
    } catch (error) {
      console.error("Razorpay recurring create order failed:", error);
      return JsonOne(500, "Could not create payment order", false);
    }
  });
}
