import axios, { AxiosError } from "axios";

export async function getBalance(t: (key: string) => string) {
  try {
    const response = await axios.get("/api/dashboard/balance");
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

export async function getBarGraph(t: (key: string) => string) {
  try {
    const response = await axios.get("/api/dashboard/bar-graph");
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

export async function getPieChart(t: (key: string) => string) {
  try {
    const response = await axios.get("/api/dashboard/pie-chart");
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

export async function getBudgetCalendar(month: number, year: number, t: (key: string) => string) {
  try {
    const response = await axios.get(`/api/dashboard/budgetCalendar?month=${month}&year=${year}`);
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

export async function getInsights(t: (key: string) => string) {
  try {
    const response = await axios.get("/api/dashboard/insights");
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