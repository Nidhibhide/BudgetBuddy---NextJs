import mongoose from "mongoose";

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
      minlength: [2, "Description must be at least 2 characters"],
      maxlength: [200, "Description cannot exceed 200 characters"],
      required: true,
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
        validator: function(value: Date) {
          return value >= new Date();
        },
        message: "Due date cannot be in the past"
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
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
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
upcomingBillSchema.index({ user: 1, isDeleted: 1, dueDate: 1 });
upcomingBillSchema.index({ user: 1, status: 1 });

export default mongoose.models.UpcomingBill || mongoose.model("UpcomingBill", upcomingBillSchema);