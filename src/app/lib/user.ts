import axios from "axios";
import { ApiResponse } from "@/app/types/appTypes";

export async function updateFinancialSettings(data: { names: string[]; currency: string; limit: number }): Promise<ApiResponse> {
  try {
    const response = await axios.put("/api/auth/financialSettings", data);

    return {
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error updating financial settings:", error);
    return {
      message: error.response?.data?.message || "Something went wrong while updating financial settings",
      success: false,
      statusCode: error.response?.status || 500,
    };
  }
}

export async function checkCategoryHasExpenses(data: { category: string }): Promise<ApiResponse> {
  try {
    const response = await axios.post("/api/user/checkCategoryHasExpenses", data);

    return {
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error checking category expenses:", error);
    return {
      message: error.response?.data?.message || "Something went wrong while checking category expenses",
      success: false,
      statusCode: error.response?.status || 500,
    };
  }
}

export async function reassignCategories(data: { oldToNewMap: Record<string, string> }): Promise<ApiResponse> {
  try {
    const response = await axios.post("/api/user/reassignCategory", data);

    return {
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error reassigning categories:", error);
    return {
      message: error.response?.data?.message || "Something went wrong while reassigning categories",
      success: false,
      statusCode: error.response?.status || 500,
    };
  }
}

