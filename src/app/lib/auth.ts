import { RegisterUserData, ApiResponse } from "@/app/types/appTypes";

export async function registerUser(data: RegisterUserData): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();

    return {
      message: result.message,
      success: response.ok,
      statusCode: result.statusCode || response.status,
      data: result.data,
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      message: "Something went wrong while registering",
      success: false,
      statusCode: 500,
    };
  }
}


