import Category from "@/app/backend/models/category";

export async function getOrCreateBillsCategory(userId: string) {
  let category = await Category.findOne({
    name: "Bills",
    type: "Expense",
    user: userId,
    isArchived: false,
  });

  if (!category) {
    category = await Category.create({
      name: "Bills",
      type: "Expense",
      user: userId,
      budgetLimit: 0,
      goal: 0,
    });
  }

  return category;
}
