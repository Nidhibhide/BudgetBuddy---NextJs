import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/app/backend/config/MongoDB";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { Session } from "@/app/types/appTypes";
import Joi from "joi";

export async function withAuthAndDB<T>(
  handler: (session: Session, userId: string, t?: (key: string) => string) => Promise<T>
): Promise<T | Response> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return JsonOne(401, "Unauthorized", false);
    }
    return await handler(session as Session, session.user.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return JsonOne(500, "An error occurred", false);
  }
}

export function validateQueryParams(params: Record<string, unknown>, schema: Joi.ObjectSchema) {
  const { error } = schema.validate(params);
  if (error) {
    return JsonOne(400, error.details[0].message, false);
  }
  return null;
}

export function validateBody<T>(body: unknown, schema: Joi.ObjectSchema): { error: Joi.ValidationError | null; value: T | null } {
  const { error, value } = schema.validate(body);
  return { error: error || null, value: error ? null : value as T };
}
