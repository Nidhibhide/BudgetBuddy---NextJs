import { withAuthAndDB, validateBody } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import { CreateCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";


export async function POST(request: Request) {
  return await withAuthAndDB(async (session, userId, t) => {
    const body = await request.json();
    const { error, value } = validateBody<{ name: string; type: string; budgetLimit?: number; goal?: number }>(body, CreateCategory(t));

    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { name, type, budgetLimit, goal } = value!;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name,
      type,
      user: userId,
      isArchived: false,
    });

    if (existingCategory) {
      return JsonOne(400, t("backend.api.categoryAlreadyExists"), false);
    }

    const newCategory = new Category({
      name,
      type,
      budgetLimit: type === 'Expense' ? budgetLimit : 0,
      goal: type === 'Income' ? goal : 0,
      user: userId,
    });

    await newCategory.save();

    return JsonOne(201, t("backend.api.success"), true, {
      category: newCategory
    });
  });
}