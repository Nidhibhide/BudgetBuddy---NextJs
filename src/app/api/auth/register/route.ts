import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import bcrypt from "bcryptjs";
import { Register } from "@/app/backend/validations/user";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { error } = Register.validate(body);
    if (error) {
      return Response.json(
        {
          success: false,
          message: error.details[0].message,
        },
        {
          status: 400,
        }
      );
    }
    const { password, name, email } = body;
    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
      return Response.json(
        {
          success: false,
          message: "User already exists with this email",
        },
        {
          status: 400,
        }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error resgistering user",
      },
      {
        status: 500,
      }
    );
  }
}
