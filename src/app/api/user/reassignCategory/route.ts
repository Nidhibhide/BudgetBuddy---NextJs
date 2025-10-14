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
    const { oldToNewMap } = body;

    if (!oldToNewMap || typeof oldToNewMap !== 'object') {
      return Response.json(
        {
          success: false,
          message: "oldToNewMap is required and must be an object",
        },
        {
          status: 400,
        }
      );
    }

    // Update expenses for each category mapping
    const updatePromises = Object.entries(oldToNewMap).map(([oldCategory, newCategory]) =>
      Expense.updateMany(
        { user: userId, category: oldCategory, isDeleted: false },
        { category: newCategory }
      )
    );

    await Promise.all(updatePromises);

    return Response.json(
      {
        success: true,
        message: "Categories reassigned successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error reassigning categories", error);
    return Response.json(
      {
        success: false,
        message: "Error reassigning categories",
      },
      {
        status: 500,
      }
    );
  }
}