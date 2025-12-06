import axios, { AxiosError } from "axios";
import { UpcomingBill } from "@/app/types/appTypes";

export async function addUpcomingBill(data: UpcomingBill, t: (key: string) => string) {
  try {
    const response = await axios.post("/api/upcomingBill/create", data);

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

export async function getUpcomingBills(t: (key: string) => string, status?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string) {
  try {
    const response = await axios.get(
      `/api/upcomingBill/details?status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
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

export async function deleteUpcomingBill(id: string, t: (key: string) => string) {
  try {
    const response = await axios.delete(`/api/upcomingBill/delete?id=${id}`);
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

export async function editUpcomingBill(id: string, data: Partial<UpcomingBill>, t: (key: string) => string) {
  try {
    const response = await axios.put(`/api/upcomingBill/edit?id=${id}`, data);
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