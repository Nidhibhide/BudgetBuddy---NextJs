import axios, { AxiosError } from "axios";

export async function getBalance() {
  try {
    const response = await axios.get("/api/dashboard/balance");
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("An error occurred. Please try again.", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "An error occurred. Please try again.",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getBarGraph() {
  try {
    const response = await axios.get("/api/dashboard/bar-graph");
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("An error occurred. Please try again.", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "An error occurred. Please try again.",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getPieChart() {
  try {
    const response = await axios.get("/api/dashboard/pie-chart");
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("An error occurred. Please try again.", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "An error occurred. Please try again.",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getBudgetCalendar(month: number, year: number) {
  try {
    const response = await axios.get(`/api/dashboard/budgetCalendar?month=${month}&year=${year}`);
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("An error occurred. Please try again.", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "An error occurred. Please try again.",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}

export async function getInsights() {
  try {
    const response = await axios.get("/api/dashboard/insights");
    return { ...response.data, statusCode: response.status };
  } catch (error: unknown) {
    console.error("An error occurred. Please try again.", error);
    const axiosError = error as AxiosError;
    return {
      message:
        (axiosError.response?.data as { message?: string })?.message ||
        "An error occurred. Please try again.",
      success: false,
      statusCode: axiosError.response?.status || 500,
    };
  }
}