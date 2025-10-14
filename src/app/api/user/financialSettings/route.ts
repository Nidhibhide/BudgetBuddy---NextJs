import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import Category from "@/app/backend/models/category";
import Budget from "@/app/backend/models/budget";
import { FinancialSettings } from "@/app/backend/validations/user";

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { error } = FinancialSettings.validate(body);
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
    const { names, currency, limit } = body;

    // Update user currency
    await User.findByIdAndUpdate(userId, { currency });

    // Update or create categories
    await Category.findOneAndUpdate(
      { user: userId },
      { names },
      { upsert: true, new: true }
    );

    // Update or create budget
    await Budget.findOneAndUpdate(
      { user: userId },
      { budget: limit },
      { upsert: true, new: true }
    );

    return Response.json(
      {
        success: true,
        message: "Financial settings updated successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error updating financial settings", error);
    return Response.json(
      {
        success: false,
        message: "Error updating financial settings",
      },
      {
        status: 500,
      }
    );
  }
}