import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Category from "@/app/backend/models/category";
import { CreateCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return JsonOne(401, "Unauthorized", false);
    }

    const userId = session.user.id;
    const body = await request.json();
    const { error } = CreateCategory.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { name, type } = body;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name,
      type,
      user: userId,
      isArchived: false,
    });

    if (existingCategory) {
      return JsonOne(400, "Category already exists", false);
    }

    const newCategory = new Category({
      name,
      type,
      user: userId,
    });

    await newCategory.save();

    return JsonOne(201, "Category created successfully", true, {
      category: newCategory
    });
  } catch (error) {
    console.log("Error creating category", error);
    return JsonOne(500, "Error creating category", false);
  }
}