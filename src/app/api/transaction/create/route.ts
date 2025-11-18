import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import Transaction from "@/app/backend/models/transaction";
import Category from "@/app/backend/models/category";
import User from "@/app/backend/models/user";
import { CreateTransaction } from "@/app/backend/validations/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR } from "@/app/backend/utils/currencyConverter";
import { checkLimitForCreate } from "@/app/backend/utils/transactionChecks";
import { getT } from "@/app/backend/utils/getTranslations";

export async function POST(request: Request) {
  const t = await getT();
  return await withAuthAndDB(async (session, userId) => {
    const body = await request.json();
    const { error } = CreateTransaction.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { date, title, description, category, amount, type } = body;

    // Get user's currency
    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, t('backend.user.notFound'), false);
    }

    // Convert amount to INR
    const amountInINR = await convertToINR(amount, user.currency, t);

    // Find the category by name and user
    const categoryDoc = await Category.findOne({
      name: category,
      user: userId,
      type: type,
      isArchived: false,
    });

    if (!categoryDoc) {
      return JsonOne(400, t('backend.category.notFound'), false);
    }

    // Check budget limit or goal
    const limitCheck = await checkLimitForCreate(
      categoryDoc._id.toString(),
      userId,
      type,
      amountInINR,
      user.currency,
      t
    );
    if (!limitCheck.success) {
      return JsonOne(400, limitCheck.message || t('backend.transaction.limitCheckFailed'), false);
    }

    // Update user balance with converted amount
    const balanceUpdate = await updateUserBalance(userId, amountInINR, type, t);
    if (!balanceUpdate.success) {
      return JsonOne(400, balanceUpdate.message || t('backend.transaction.balanceUpdateFailed'), false);
    }

    const newTransaction = new Transaction({
      title,
      amount: amountInINR,
      type,
      category: categoryDoc._id,
      date: new Date(date),
      description,
      user: userId,
    });

    await newTransaction.save();

    return JsonOne(201, t('backend.transaction.createdSuccessfully'), true, {
      transaction: newTransaction,
    });
  });
}