import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import {
  getRazorpayInstance,
  toRazorpayAmount,
} from "@/app/backend/utils/razorpay";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const billId = body?.billId as string | undefined;

    if (!billId) {
      return JsonOne(400, "Bill id is required", false);
    }

    const bill = await UpcomingBill.findOne({
      _id: billId,
      user: userId,
      isDeleted: false,
    });

    if (!bill) {
      return JsonOne(404, "Upcoming bill not found", false);
    }

    if (bill.status === "Paid") {
      return JsonOne(400, "Bill is already paid", false);
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

    const amountInSubunits = toRazorpayAmount(bill.amount);

    if (amountInSubunits < 100) {
      return JsonOne(400, "Minimum payment amount is 1.00", false);
    }

    try {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.create({
        amount: amountInSubunits,
        currency: "INR",
        receipt: `bill_${String(bill._id).slice(-8)}_${Date.now()}`.slice(
          0,
          40
        ),
        notes: {
          billId: String(bill._id),
          userId: String(userId),
          title: bill.title,
        },
      });

      bill.razorpayOrderId = order.id;
      bill.paymentStatus = "pending";
      await bill.save({ validateModifiedOnly: true });

      return JsonOne(200, "Order created", true, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        billId: String(bill._id),
        billTitle: bill.title,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
      });
    } catch (error) {
      console.error("Razorpay create order failed:", error);
      return JsonOne(500, "Could not create payment order", false);
    }
  });
}
