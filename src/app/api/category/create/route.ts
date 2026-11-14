import { withAuthAndDB, validateBody } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import User from "@/app/backend/models/user";
import { CreateCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import {
  convertToINR,
  convertFromINR,
} from "@/app/backend/utils/currencyConverter";

export async function POST(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const body = await request.json();
    const { error, value } = validateBody<{
      name: string;
      type: string;
      budgetLimit?: number;
      goal?: number;
    }>(body, CreateCategory());

    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { name, type, budgetLimit, goal } = value!;

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    const existingCategory = await Category.findOne({
      name,
      type,
      user: userId,
      isArchived: false,
    });

    if (existingCategory) {
      return JsonOne(400, "Category already exists", false);
    }

    const budgetLimitInINR =
      type === "Expense" && budgetLimit
        ? await convertToINR(budgetLimit, user.currency || "INR")
        : 0;
    const goalInINR =
      type === "Income" && goal
        ? await convertToINR(goal, user.currency || "INR")
        : 0;

    const newCategory = new Category({
      name,
      type,
      budgetLimit: budgetLimitInINR,
      goal: goalInINR,
      user: userId,
    });

    await newCategory.save();

    return JsonOne(201, "Category added", true, {
      category: {
        ...newCategory.toObject(),
        budgetLimit: await convertFromINR(
          newCategory.budgetLimit || 0,
          user.currency || "INR"
        ),
        goal: await convertFromINR(newCategory.goal || 0, user.currency || "INR"),
      },
    });
  });
}
