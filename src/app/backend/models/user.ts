import mongoose from "mongoose";
import { CURRENCIES } from "../../../../constants";
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
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
  },
  {
    timestamps: true,
  } // auto adds createdAt and updatedAt
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
