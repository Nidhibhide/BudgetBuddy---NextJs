import { withAuthAndDB } from "@/app/backend/utils/ApiHandler";
import User from "@/app/backend/models/user";
import { Update } from "@/app/backend/validations/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { getT } from "@/app/backend/utils/getTranslations";

export async function PUT(request: Request) {
  const t = await getT();
  return await withAuthAndDB(async (session, userId) => {
    const body = await request.json();
    const { error } = Update.validate(body);
    if (error) {
      return JsonOne(400, error.details[0].message, false);
    }
    const { name, email, currency } = body;

    // Fetch the current user to check authProvider
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return JsonOne(404, t('backend.user.notFound'), false);
    }

    // If user is authorized via Google, prevent email update
    if (currentUser.authProvider === "google" && email !== currentUser.email) {
      return JsonOne(400, t('backend.user.cannotUpdateEmailForGoogle'), false);
    }

    // Check if email is already taken by another user (only if email is being updated)
    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return JsonOne(400, t('backend.user.emailAlreadyInUse'), false);
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, currency },
      { new: true }
    );
    if (!updatedUser) {
      return JsonOne(404, t('backend.user.notFound'), false);
    }

    // Update the session with new user data
    // Note: This is a server-side update, but the client will need to refresh the session

    return JsonOne(200, t('backend.user.profileUpdatedSuccessfully'), true, {
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
    });
  });
}
