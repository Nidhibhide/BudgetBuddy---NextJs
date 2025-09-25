import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return Response.json(
        {
          success: false,
          message: "User not found with this email",
        },
        { status: 404 }
      );
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // 3. Success (you can generate JWT here if required)
    return JsonOne(200, "Login successful", true, {
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error logging in user", error);
    return Response.json(
      {
        success: false,
        message: "Error logging in user",
      },
      { status: 500 }
    );
  }
}
