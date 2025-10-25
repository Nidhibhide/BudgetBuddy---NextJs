import UserModel from "../models/user";

export async function updateUserBalance(
  userId: string,
  amount: number,
  type: string
): Promise<{ success: boolean; message?: string }> {
  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (type === "Expense" && user.totalBalance < amount) {
    return { success: false, message: "Insufficient balance" };
  }

  if (type === "Income") {
    user.totalBalance += amount;
  } else if (type === "Expense") {
    user.totalBalance -= amount;
  }

  await user.save();
  return { success: true };
}