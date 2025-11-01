import { TYPES } from "@/lib/constants";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, "Category name cannot be empty"],
    maxlength: [50, "Category name cannot exceed 50 characters"],
  },
  type: {
    type: String,
    enum: TYPES,
    required: true,
  },
  icon: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, "Icon cannot be empty"],
    maxlength: [100, "Icon cannot exceed 100 characters"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true }
);

// Add indexes for performance
categorySchema.index({ user: 1, type: 1, isArchived: 1 });
categorySchema.index({ user: 1, name: 1, type: 1 });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
