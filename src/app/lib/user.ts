import { RegisterUserData, ApiResponse, SignInFormValues } from "../types";

export async function registerUser(data: RegisterUserData): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/user/register", {
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

export async function signInUser(data: SignInFormValues): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/user/login", {
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
    console.error("Error signing in user:", error);
    return {
      message: "Something went wrong while signing in",
      success: false,
      statusCode: 500,
    };
  }
}
