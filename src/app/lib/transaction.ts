import axios, { AxiosError } from "axios";
import { Transaction } from "@/app/types/appTypes";

export async function addTransaction(data: Transaction) {
  try {
    const response = await axios.post("/api/transaction/create", data);

    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error adding transaction:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while adding transaction",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getTransactions(type: string, category?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string) {
  try {
    const response = await axios.get(
      `/api/transaction/details?type=${type}&category=${category}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error fetching transactions:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while fetching transactions",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getTransactionTotals(type: string) {
  try {
    const response = await axios.get(
      `/api/transaction/total?type=${type}`
    );
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("Error fetching transaction totals:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while fetching transaction totals",
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
    console.error("Error editing transaction:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while editing transaction",
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
    console.error("Error deleting transaction:", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "Something went wrong while deleting transaction",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

