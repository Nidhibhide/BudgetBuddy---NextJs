import mongoose from "mongoose";
import { isDateNotPast } from "@/app/lib/dateUtils";

const recurringPaymentSchema = new mongoose.Schema(
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
    nextDueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return isDateNotPast(value);
        },
        message: "Next due date cannot be in the past",
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
    frequency: {
      type: String,
      enum: ["Weekly", "Monthly", "Yearly"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    lastRazorpayPaymentId: {
      type: String,
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

recurringPaymentSchema.index({ user: 1, isDeleted: 1, nextDueDate: 1 });
recurringPaymentSchema.index({ user: 1, status: 1 });

if (mongoose.models.RecurringPayment) {
  delete mongoose.models.RecurringPayment;
}

export default mongoose.model("RecurringPayment", recurringPaymentSchema);
