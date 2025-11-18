import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import User from "@/app/backend/models/user";
import bcrypt from "bcryptjs";
import { ChangePassword } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getT } from "@/app/backend/utils/getTranslations";

export async function POST(request: Request) {
  const t = await getT();
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
      return JsonOne(404, t('backend.user.notFound'), false);
    }
    if (!user.password) {
      return JsonOne(404, t('backend.user.oldPasswordNotFound'), false);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return JsonOne(401, t('backend.user.incorrectOldPassword'), false);
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);
    user.password = hashedPass;

    await user.save();

    return JsonOne(201, t('backend.user.passwordChangedSuccessfully'), true);
  });
}