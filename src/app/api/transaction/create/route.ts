import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import Transaction from "@/app/backend/models/transaction";
import Category from "@/app/backend/models/category";
import User from "@/app/backend/models/user";
import { CreateTransaction } from "@/app/backend/validations/transaction";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { updateUserBalance } from "@/app/backend/utils/updateBalance";
import { convertToINR } from "@/app/backend/utils/currencyConverter";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return JsonOne(401, "Unauthorized", false);
    }

    const userId = session.user.id;
    const body = await request.json();
    const { error } = CreateTransaction.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }

    const { date, title, description, category, amount, type } = body;

    // Get user's currency
    const user = await User.findById(userId);
    if (!user) {
      return JsonOne(404, "User not found", false);
    }

    // Convert amount to INR
    const amountInINR = await convertToINR(amount, user.currency);

    // Find the category by name and user
    const categoryDoc = await Category.findOne({
      name: category,
      user: userId,
      type: type,
      isArchived: false,
    });

    if (!categoryDoc) {
      return JsonOne(400, "Category not found", false);
    }

    // Update user balance with converted amount
    const balanceUpdate = await updateUserBalance(userId, amountInINR, type);
    if (!balanceUpdate.success) {
      return JsonOne(400, balanceUpdate.message || "Balance update failed", false);
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

    return JsonOne(201, "Transaction created successfully", true, {
      transaction: newTransaction,
    });
  } catch (error) {
    console.log("Error creating transaction", error);
    return JsonOne(500, error instanceof Error ? error.message : "Error creating transaction", false);
  }
}