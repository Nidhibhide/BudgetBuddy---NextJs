import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import { EditCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
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

    const { name, budgetLimit, goal, type } = body;

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
      type: type || existingCategory.type,
      user: userId,
      isArchived: false,
      _id: { $ne: categoryId },
    });

    if (duplicateCategory) {
      return JsonOne(400, "Category name already exists", false);
    }

    existingCategory.name = name;
    if (type) {
      existingCategory.type = type;
    }
    if (budgetLimit !== undefined) {
      existingCategory.budgetLimit = type === 'Expense' || (!type && existingCategory.type === 'Expense') ? budgetLimit : 0;
    }
    if (goal !== undefined) {
      existingCategory.goal = type === 'Income' || (!type && existingCategory.type === 'Income') ? goal : 0;
    }
    await existingCategory.save();

    return JsonOne(200, "Category updated successfully", true, {
      category: existingCategory
    });
  });
}