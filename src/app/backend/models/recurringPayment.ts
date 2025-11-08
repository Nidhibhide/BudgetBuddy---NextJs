import mongoose from "mongoose";

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
      minlength: [2, "Description must be at least 2 characters"],
      maxlength: [200, "Description cannot exceed 200 characters"],
      required: true,
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
        validator: function(value: Date) {
          return value >= new Date();
        },
        message: "Next due date cannot be in the past"
      }
    },
    reminderDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value: Date) {
          return value >= new Date();
        },
        message: "Reminder date cannot be in the past"
      }
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
    isDeleted: { type: Boolean, default: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Add indexes for performance
recurringPaymentSchema.index({ user: 1, isDeleted: 1, nextDueDate: 1 });
recurringPaymentSchema.index({ user: 1, status: 1 });

export default mongoose.models.RecurringPayment || mongoose.model("RecurringPayment", recurringPaymentSchema);