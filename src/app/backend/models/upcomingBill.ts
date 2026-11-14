import mongoose from "mongoose";
import { isDateNotPast } from "@/app/lib/dateUtils";

const upcomingBillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return isDateNotPast(value);
        },
        message: "Due date cannot be in the past",
      },
    },
    reminderDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return isDateNotPast(value);
        },
        message: "Reminder date cannot be in the past",
      },
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "paid", "failed"],
      default: "none",
    },
    expenseTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

upcomingBillSchema.index({ user: 1, isDeleted: 1, dueDate: 1 });
upcomingBillSchema.index({ user: 1, status: 1 });

if (mongoose.models.UpcomingBill) {
  delete mongoose.models.UpcomingBill;
}

export default mongoose.model("UpcomingBill", upcomingBillSchema);
