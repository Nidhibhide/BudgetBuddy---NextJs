import axios from "axios";
import { RegisterUserData, ApiResponse } from "@/app/types/appTypes";

export async function registerUser(data: RegisterUserData): Promise<ApiResponse> {
  try {
    const response = await axios.post("/api/auth/register", data);

    return {
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error registering user:", error);
    return {
      message: error.response?.data?.message || "Something went wrong while registering",
      success: false,
      statusCode: error.response?.status || 500,
    };
  }
}

export async function changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse> {
  try {
    const response = await axios.post("/api/auth/changePassword", data);

    return {
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error changing password:", error);
    return {
      message: error.response?.data?.message || "Something went wrong while changing password",
      success: false,
      statusCode: error.response?.status || 500,
    };
  }
}

export async function updateProfile(data: { name: string; email: string }): Promise<ApiResponse> {
  try {
    const response = await axios.put("/api/auth/updateProfile", data);

    return {
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return {
      message: error.response?.data?.message || "Something went wrong while updating profile",
      success: false,
      statusCode: error.response?.status || 500,
    };
  }
}