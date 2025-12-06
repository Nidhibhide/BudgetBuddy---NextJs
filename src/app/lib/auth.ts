import axios, { AxiosError } from "axios";
import {User } from "@/app/types/appTypes";

export async function registerUser(data: User, t: (key: string) => string) {
  try {
    const response = await axios.post("/api/auth/register", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error(t("backend.api.errorOccurred"), error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        t("backend.api.errorOccurred"),
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}, t: (key: string) => string) {
  try {
    const response = await axios.post("/api/auth/changePassword", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error(t("backend.api.errorOccurred"), error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        t("backend.api.errorOccurred"),
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function updateProfile(data: User, t: (key: string) => string) {
  try {
    const response = await axios.put("/api/auth/updateProfile", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error(t("backend.api.errorOccurred"), error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        t("backend.api.errorOccurred"),
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}
