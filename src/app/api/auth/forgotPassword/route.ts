import crypto from "crypto";
import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import { ForgotPassword } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import expireTime from "@/app/backend/utils/expireTime";
import {
  transporterFun,
  mailOptionsForResetPass,
} from "@/app/backend/utils/sendEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { error } = ForgotPassword().validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { email } = body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    if (user.authProvider === "google" && !user.password) {
      return JsonOne(
        400,
        "This account uses Google sign-in. Please sign in with Google.",
        false
      );
    }

    const token = crypto.randomBytes(12).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpire = expireTime();
    await user.save();

    const transporter = transporterFun();
    await transporter.sendMail(mailOptionsForResetPass(email, token));

    return JsonOne(
      200,
      `Reset link sent to ${email}. Click it to reset your password.`,
      true
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return JsonOne(500, "Something went wrong. Please try again later.", false);
  }
}
