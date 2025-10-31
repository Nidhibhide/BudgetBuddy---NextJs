import { TYPES } from "@/lib/constants";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
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

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
