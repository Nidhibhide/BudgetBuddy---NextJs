// utils/JsonOne.ts
import { ApiResponse } from "@/app/types/appTypes";

export function JsonOne(
  statusCode: number,
  message: string,
  success: boolean,
  data?: object
): Response {
  const response: ApiResponse = {
    message,
    success,
    statusCode,
    ...(data ? { data } : {}),
  };

  return Response.json(response, { status: statusCode });
}

export function JsonAll(
  statusCode: number,
  message: string,
  success: boolean,
  data?: object,
  pagination?: object
): Response {
  return Response.json(
    {
      message,
      success,
      statusCode,
      ...(data && { data }),
      ...(pagination && { pagination }),
    },
    { status: statusCode }
  );
}
