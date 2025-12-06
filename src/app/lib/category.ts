import axios, { AxiosError } from "axios";
import { Category } from "@/app/types/appTypes";

export async function createCategory(data: Category, t: (key: string) => string) {
  try {
    const response = await axios.post("/api/category/create", data);

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

export async function getCategoryDetails(type: string, t: (key: string) => string) {
  try {
    const response = await axios.get(`/api/category/details?type=${type}`);
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

export async function editCategory(id: string, data: Category, t: (key: string) => string) {
  try {
    const response = await axios.put(`/api/category/edit?id=${id}`, data);
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


export async function deleteCategory(id: string, t: (key: string) => string, reassignCategoryId?: string) {
  try {
    const url = reassignCategoryId
      ? `/api/category/delete?id=${id}&reassignCategoryId=${reassignCategoryId}`
      : `/api/category/delete?id=${id}`;
    const response = await axios.delete(url);
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

