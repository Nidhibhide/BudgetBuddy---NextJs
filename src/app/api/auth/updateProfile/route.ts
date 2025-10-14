import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import { Update } from "@/app/backend/validations/user";

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
    const { error } = Update.validate(body);
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
    const { name, email } = body;

    // Fetch the current user to check authProvider
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // If user is authorized via Google, prevent email update
    if (currentUser.authProvider === "google" && email !== currentUser.email) {
      return Response.json(
        {
          success: false,
          message: "Cannot update email for Google authorized users",
        },
        {
          status: 400,
        }
      );
    }

    // Check if email is already taken by another user (only if email is being updated)
    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return Response.json(
          {
            success: false,
            message: "Email already in use",
          },
          {
            status: 400,
          }
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Update the session with new user data
    // Note: This is a server-side update, but the client will need to refresh the session

    return Response.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error updating profile", error);
    return Response.json(
      {
        success: false,
        message: "Error updating profile",
      },
      {
        status: 500,
      }
    );
  }
}
