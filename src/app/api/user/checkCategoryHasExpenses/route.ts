import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Expense from "@/app/backend/models/expense";

export async function POST(request: Request) {
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
    const { category } = body;

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category is required",
        },
        {
          status: 400,
        }
      );
    }

    const expenseCount = await Expense.countDocuments({
      user: userId,
      category,
      isDeleted: false,
    });

    return Response.json(
      {
        success: true,
        hasExpenses: expenseCount > 0,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error checking category expenses", error);
    return Response.json(
      {
        success: false,
        message: "Error checking category expenses",
      },
      {
        status: 500,
      }
    );
  }
}