import axios, { AxiosError } from "axios";
import { UpcomingBill } from "@/app/types/appTypes";

export async function addUpcomingBill(data: UpcomingBill) {
  try {
    const response = await axios.post("/api/upcomingBill/create", data);

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

export async function getUpcomingBills(
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
      `/api/upcomingBill/details?${params.toString()}`
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

export async function deleteUpcomingBill(id: string) {
  try {
    const response = await axios.delete(`/api/upcomingBill/delete?id=${id}`);
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

export async function editUpcomingBill(id: string, data: Partial<UpcomingBill>) {
  try {
    const response = await axios.put(`/api/upcomingBill/edit?id=${id}`, data);
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

export async function markUpcomingBillPaid(
  id: string,
  status: "Paid" | "Unpaid" = "Paid"
) {
  try {
    const response = await axios.put(`/api/upcomingBill/markPaid?id=${id}`, {
      status,
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

export async function createBillPaymentOrder(billId: string) {
  try {
    const response = await axios.post("/api/payment/create-order", { billId });
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

export async function verifyBillPayment(payload: {
  billId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const response = await axios.post("/api/payment/verify", payload);
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
