import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import UpcomingBill from "@/app/backend/models/upcomingBill";
import Transaction from "@/app/backend/models/transaction";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { verifyPaymentSignature } from "@/app/backend/utils/razorpay";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { getOrCreateBillsCategory } from "@/app/backend/utils/billsCategory";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const {
      billId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body || {};

    if (
      !billId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return JsonOne(400, "Payment details are required", false);
    }

    const bill = await UpcomingBill.findOne({
      _id: billId,
      user: userId,
      isDeleted: false,
    });

    if (!bill) {
      return JsonOne(404, "Upcoming bill not found", false);
    }

    // Already paid + expense created → idempotent success
    if (bill.status === "Paid" && bill.expenseTransactionId) {
      return JsonOne(200, "Bill already paid", true, {
        upcomingBill: bill,
        alreadyProcessed: true,
      });
    }

    if (
      bill.razorpayOrderId &&
      bill.razorpayOrderId !== razorpay_order_id
    ) {
      return JsonOne(400, "Order does not match this bill", false);
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      bill.paymentStatus = "failed";
      await bill.save({ validateModifiedOnly: true });
      return JsonOne(400, "Payment verification failed", false);
    }

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    let expenseId = bill.expenseTransactionId;

    if (!expenseId) {
      const category = await getOrCreateBillsCategory(userId);
      // Bill amount is already stored in INR
      const amountInINR = bill.amount;

      // Payment already succeeded externally — still record expense
      const balanceUpdate = await updateUserBalance(
        userId,
        amountInINR,
        "Expense"
      );
      if (!balanceUpdate.success) {
        // Allow recording even if tracked balance is short
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
        title: bill.title,
        amount: amountInINR,
        type: "Expense",
        category: category._id,
        date: new Date(),
        description: bill.description || `Paid via Razorpay (${razorpay_payment_id})`,
        user: userId,
      });

      expenseId = expense._id;
    }

    bill.status = "Paid";
    bill.paymentStatus = "paid";
    bill.razorpayOrderId = razorpay_order_id;
    bill.razorpayPaymentId = razorpay_payment_id;
    bill.expenseTransactionId = expenseId;
    await bill.save({ validateModifiedOnly: true });

    return JsonOne(200, "Payment successful. Bill marked as paid.", true, {
      upcomingBill: bill,
      expenseTransactionId: expenseId,
    });
  });
}
