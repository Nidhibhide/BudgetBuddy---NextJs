import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import User from "@/app/backend/models/user";
import bcrypt from "bcryptjs";
import { ChangePassword } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function POST(request: Request) {
  return await withAuthAndDB(async (session) => {
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
  });
}