import UserModel from "../models/user";

export async function updateUserBalance(
  userId: string,
  amount: number,
  type: string,
  t: (key: string) => string
): Promise<{ success: boolean; message?: string }> {
  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, message: t('backend.user.notFound') };
  }

  if (type === "Expense" && user.totalBalance < amount) {
    return { success: false, message: t('backend.user.insufficientBalance') };
  }

  if (type === "Income") {
    user.totalBalance += amount;
  } else if (type === "Expense") {
    user.totalBalance -= amount;
  }

  await user.save();
  return { success: true };
}