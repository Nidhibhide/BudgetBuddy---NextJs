import axios, { AxiosError } from "axios";
import { Category } from "@/app/types/appTypes";

export async function createCategory(data: Category) {
  try {
    const response = await axios.post("/api/category/create", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while creating category",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getCategoryDetails(type: string) {
  try {
    const response = await axios.get(`/api/category/details?type=${type}`);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error fetching category details:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while fetching category details",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}
