import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import bcrypt from "bcryptjs";
import { ResetPassword } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return JsonOne(401, "Token not provided", false);
    }

    const user = await User.findOne(
      { resetPasswordToken: token },
      { resetPasswordExpire: 1, email: 1 }
    );

    if (!user || !user.resetPasswordExpire) {
      return JsonOne(404, "Invalid or expired reset link", false);
    }

    if (new Date() > user.resetPasswordExpire) {
      return JsonOne(400, "Reset link expired", false);
    }

    return JsonOne(200, "Success", true, { email: user.email });
  } catch (error) {
    console.error("Reset password verify error:", error);
    return JsonOne(500, "Failed to verify reset link", false);
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { error } = ResetPassword().validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { token, newPassword } = body;

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user || !user.resetPasswordExpire) {
      return JsonOne(404, "Invalid or expired reset link", false);
    }

    if (new Date() > user.resetPasswordExpire) {
      return JsonOne(400, "Reset link expired", false);
    }

    if (user.password) {
      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) {
        return JsonOne(
          400,
          "New password must be different from your previous password",
          false
        );
      }
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPass },
        $unset: { resetPasswordToken: "", resetPasswordExpire: "" },
      }
    );

    return JsonOne(200, "Password reset successfully", true);
  } catch (error) {
    console.error("Reset password error:", error);
    return JsonOne(500, "Failed to reset password", false);
  }
}
