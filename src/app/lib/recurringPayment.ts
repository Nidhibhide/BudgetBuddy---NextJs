import axios, { AxiosError } from "axios";
import { RecurringPayment } from "@/app/types/appTypes";

export async function addRecurringPayment(data: RecurringPayment, t: (key: string) => string) {
  try {
    const response = await axios.post("/api/recurringPayment/create", data);

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

export async function getRecurringPayments(t: (key: string) => string, status?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string) {
  try {
    const response = await axios.get(
      `/api/recurringPayment/details?status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
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

export async function deleteRecurringPayment(id: string, t: (key: string) => string) {
  try {
    const response = await axios.delete(`/api/recurringPayment/delete?id=${id}`);
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

export async function editRecurringPayment(id: string, data: Partial<RecurringPayment>, t: (key: string) => string) {
  try {
    const response = await axios.put(`/api/recurringPayment/edit?id=${id}`, data);
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