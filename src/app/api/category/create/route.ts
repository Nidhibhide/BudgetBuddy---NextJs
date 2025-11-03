import { withAuthAndDB, validateBody } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import { CreateCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";

export async function POST(request: Request) {
  return await withAuthAndDB(async (session, userId) => {
    const body = await request.json();
    const { error, value } = validateBody<{ name: string; type: string; icon: string; budgetLimit?: number; goal?: number }>(body, CreateCategory);

    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { name, type, icon, budgetLimit, goal } = value!;

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
      icon,
      budgetLimit: type === 'Expense' ? budgetLimit : 0,
      goal: type === 'Income' ? goal : 0,
      user: userId,
    });

    await newCategory.save();

    return JsonOne(201, "Category created successfully", true, {
      category: newCategory
    });
  });
}