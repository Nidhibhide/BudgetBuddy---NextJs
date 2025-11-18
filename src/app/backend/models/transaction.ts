import { TYPES } from "@/constants";
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: TYPES,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    date: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(value: Date) {
          return value <= new Date();
        },
        message: "Transaction date cannot be in the future"
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Add indexes for performance
transactionSchema.index({ user: 1, isDeleted: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
