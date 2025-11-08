import axios, { AxiosError } from "axios";
import { UpcomingBill } from "@/app/types/appTypes";

export async function addUpcomingBill(data: UpcomingBill) {
  try {
    const response = await axios.post("/api/upcomingBill/create", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error adding upcoming bill:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while adding upcoming bill",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getUpcomingBills(status?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string) {
  try {
    const response = await axios.get(
      `/api/upcomingBill/details?status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error fetching upcoming bills:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while fetching upcoming bills",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function deleteUpcomingBill(id: string) {
  try {
    const response = await axios.delete(`/api/upcomingBill/delete?id=${id}`);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error deleting upcoming bill:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while deleting upcoming bill",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function editUpcomingBill(id: string, data: Partial<UpcomingBill>) {
  try {
    const response = await axios.put(`/api/upcomingBill/edit?id=${id}`, data);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error editing upcoming bill:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while editing upcoming bill",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}