import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Category from "@/app/backend/models/category";
import { EditCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return JsonOne(401, "Unauthorized", false);
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("id");

    if (!categoryId) {
      return JsonOne(400, "Category ID is required", false);
    }

    const body = await request.json();
    const { error } = EditCategory.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { name } = body;

    // Check if category exists and belongs to user
    const existingCategory = await Category.findOne({
      _id: categoryId,
      user: userId,
      isArchived: false,
    });

    if (!existingCategory) {
      return JsonOne(404, "Category not found", false);
    }

    // Check if new name already exists for this user and type
    const duplicateCategory = await Category.findOne({
      name,
      type: existingCategory.type,
      user: userId,
      isArchived: false,
      _id: { $ne: categoryId },
    });

    if (duplicateCategory) {
      return JsonOne(400, "Category name already exists", false);
    }

    existingCategory.name = name;
    await existingCategory.save();

    return JsonOne(200, "Category updated successfully", true, {
      category: existingCategory
    });
  } catch (error) {
    console.log("Error updating category", error);
    return JsonOne(500, "Error updating category", false);
  }
}