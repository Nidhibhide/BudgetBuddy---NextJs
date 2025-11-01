import mongoose from "mongoose";
import { CURRENCIES } from "@/lib/constants";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: {
      type: String,
      required: false, // Will handle validation in pre-save hook or application logic
    },
    authProvider: {
      type: String,
      enum: ["google", "local"],
      default: "local",
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      default: "INR",
    },
    totalBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for performance
UserSchema.index({ authProvider: 1 });

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
