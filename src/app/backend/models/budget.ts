import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, "Spent amount cannot be negative"],
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
budgetSchema.index({ user: 1, category: 1 });
budgetSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
