import axios, { AxiosError } from "axios";
import { Transaction } from "@/app/types/appTypes";

export async function addTransaction(data: Transaction, t: (key: string) => string) {
  try {
    const response = await axios.post("/api/transaction/create", data);

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

export async function getTransactions(
  type: string,
  t: (key: string) => string,
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
    const response = await axios.get(
      `/api/transaction/details?type=${type}&category=${category}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&dateFrom=${dateFrom}&dateTo=${dateTo}&minAmount=${minAmount}&maxAmount=${maxAmount}`
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

export async function getTransactionTotals(type: string, t: (key: string) => string) {
  try {
    const response = await axios.get(`/api/transaction/total?type=${type}`);
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

export async function editTransaction(id: string, data: Partial<Transaction>, t: (key: string) => string) {
  try {
    const response = await axios.put(`/api/transaction/edit?id=${id}`, data);
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

export async function deleteTransaction(id: string, t: (key: string) => string) {
  try {
    const response = await axios.delete(`/api/transaction/delete?id=${id}`);
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

