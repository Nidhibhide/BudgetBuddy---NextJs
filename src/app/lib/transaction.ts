import axios, { AxiosError } from "axios";
import { Transaction } from "@/app/types/appTypes";

export async function addTransaction(data: Transaction) {
  try {
    const response = await axios.post("/api/transaction/create", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
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

export async function getTransactions(
  type: string,
  category?: string,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string,
  search?: string,
  dateFrom?: string,
  dateTo?: string,
  minAmount?: string,
  maxAmount?: string
) {
  try {
    const params = new URLSearchParams({ type });
    if (category) params.set("category", category);
    if (page != null) params.set("page", String(page));
    if (limit != null) params.set("limit", String(limit));
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);

    const response = await axios.get(
      `/api/transaction/details?${params.toString()}`
    );
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
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

export async function getTransactionTotals(type: string) {
  try {
    const response = await axios.get(`/api/transaction/total?type=${type}`);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
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

export async function editTransaction(id: string, data: Partial<Transaction>) {
  try {
    const response = await axios.put(`/api/transaction/edit?id=${id}`, data);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as { message?: string })?.message ||
      "Error Occurred";
    console.error("Error Occurred:", message);
    return {
      message,
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const response = await axios.delete(`/api/transaction/delete?id=${id}`);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
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
