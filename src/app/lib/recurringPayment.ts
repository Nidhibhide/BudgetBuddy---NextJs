import axios, { AxiosError } from "axios";
import { RecurringPayment } from "@/app/types/appTypes";

export async function addRecurringPayment(data: RecurringPayment) {
  try {
    const response = await axios.post("/api/recurringPayment/create", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error Occurred", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Error Occurred",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getRecurringPayments(status?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string) {
  try {
    const response = await axios.get(
      `/api/recurringPayment/details?status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error Occurred", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Error Occurred",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function deleteRecurringPayment(id: string) {
  try {
    const response = await axios.delete(`/api/recurringPayment/delete?id=${id}`);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error Occurred", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Error Occurred",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function editRecurringPayment(id: string, data: Partial<RecurringPayment>) {
  try {
    const response = await axios.put(`/api/recurringPayment/edit?id=${id}`, data);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error Occurred", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Error Occurred",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}
