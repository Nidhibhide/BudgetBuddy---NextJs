import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import bcrypt from "bcryptjs";
import { Register } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getTranslations } from "next-intl/server";

export async function POST(request: Request) {
  const t = await getTranslations();
  await dbConnect();
  try {
    const body = await request.json();
    const { error } = Register(t).validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }
    const { password, name, email } = body;
    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
      return JsonOne(400, t("backend.api.userAlreadyExists"), false);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();

    return JsonOne(201, t("backend.api.success"), true);
  } catch (error) {
    console.log("Error occurred", error);
    return JsonOne(500, t("backend.api.errorOccurred"), false);
  }
}
