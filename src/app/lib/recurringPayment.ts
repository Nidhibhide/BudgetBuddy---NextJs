import axios, { AxiosError } from "axios";
import { RecurringPayment } from "@/app/types/appTypes";

export async function addRecurringPayment(data: RecurringPayment) {
  try {
    const response = await axios.post("/api/recurringPayment/create", data);

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

export async function getRecurringPayments(
  status?: string,
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
    const params = new URLSearchParams();
    if (status) params.set("status", status);
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
      `/api/recurringPayment/details?${params.toString()}`
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

export async function deleteRecurringPayment(id: string) {
  try {
    const response = await axios.delete(`/api/recurringPayment/delete?id=${id}`);
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

export async function editRecurringPayment(
  id: string,
  data: Partial<RecurringPayment>
) {
  try {
    const response = await axios.put(
      `/api/recurringPayment/edit?id=${id}`,
      data
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

export async function toggleRecurringPaymentStatus(
  id: string,
  status: "Active" | "Inactive"
) {
  try {
    const response = await axios.put(
      `/api/recurringPayment/toggleStatus?id=${id}`,
      { status }
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

export async function createRecurringPaymentOrder(recurringPaymentId: string) {
  try {
    const response = await axios.post("/api/payment/recurring/create-order", {
      recurringPaymentId,
    });
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

export async function verifyRecurringPayment(payload: {
  recurringPaymentId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const response = await axios.post(
      "/api/payment/recurring/verify",
      payload
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
