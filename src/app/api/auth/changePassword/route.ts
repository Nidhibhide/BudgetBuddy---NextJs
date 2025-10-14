import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import bcrypt from "bcryptjs";
import { ChangePassword } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return JsonOne(401, "Unauthorized", false);
    }

    const body = await request.json();
    const { error } = ChangePassword.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { oldPassword, newPassword } = body;
    const email = session.user.email;

    const user = await User.findOne({ email });
    if (!user) {
      return JsonOne(404, "User not found", false);
    }
    if (!user.password) {
      return JsonOne(404, "Old password not found", false);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return JsonOne(401, "Incorrect old password", false);
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);
    user.password = hashedPass;

    await user.save();

    return JsonOne(201, "Password changed successfully", true);
  } catch (error) {
    console.error("Error occurred while change password:", error);
    return JsonOne(500, "Server error", false);
  }
}