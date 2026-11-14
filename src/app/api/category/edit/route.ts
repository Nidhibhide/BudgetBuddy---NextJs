import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Category from "@/app/backend/models/category";
import User from "@/app/backend/models/user";
import { EditCategory } from "@/app/backend/validations/category";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import {
  convertToINR,
  convertFromINR,
} from "@/app/backend/utils/currencyConverter";

export async function PUT(request: Request) {
  return await withAuthAndDB(async (_session, userId) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("id");

    const body = await request.json();
    const { error } = EditCategory().validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { name, budgetLimit, goal, type } = body;

    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    const existingCategory = await Category.findOne({
      _id: categoryId,
      user: userId,
      isArchived: false,
    });

    if (!existingCategory) {
      return JsonOne(404, "Category not found", false);
    }

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

    const categoryType = type || existingCategory.type;
    existingCategory.name = name;
    if (type) {
      existingCategory.type = type;
    }

    if (budgetLimit !== undefined) {
      if (categoryType === "Expense") {
        existingCategory.budgetLimit = await convertToINR(
          budgetLimit,
          user.currency || "INR"
        );
      } else {
        existingCategory.budgetLimit = 0;
      }
    }

    if (goal !== undefined) {
      if (categoryType === "Income") {
        existingCategory.goal = await convertToINR(
          goal,
          user.currency || "INR"
        );
      } else {
        existingCategory.goal = 0;
      }
    }

    await existingCategory.save();

    return JsonOne(200, "Category updated", true, {
      category: {
        ...existingCategory.toObject(),
        budgetLimit: await convertFromINR(
          existingCategory.budgetLimit || 0,
          user.currency || "INR"
        ),
        goal: await convertFromINR(
          existingCategory.goal || 0,
          user.currency || "INR"
        ),
      },
    });
  });
}
