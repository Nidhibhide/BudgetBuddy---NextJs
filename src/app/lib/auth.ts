import axios, { AxiosError } from "axios";
import {User } from "@/app/types/appTypes";

export async function registerUser(data: User) {
  try {
    const response = await axios.post("/api/auth/register", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error registering user:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while registering",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}) {
  try {
    const response = await axios.post("/api/auth/changePassword", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error changing password:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while changing password",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function updateProfile(data: User) {
  try {
    const response = await axios.put("/api/auth/updateProfile", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while updating profile",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}
