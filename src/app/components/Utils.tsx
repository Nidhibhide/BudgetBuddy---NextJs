'use client';

import React from "react";
import toast from "react-hot-toast";
import { MONTHS } from "../../../constants";
// import { authStore, appStore } from "../store";
import { useRouter } from "next/navigation";
import { FaUtensils, FaShoppingBag, FaCar, FaHotel } from "react-icons/fa";
import axios from "axios";

export const showSuccess = (message = "Operation Success") => {
  toast.success(message);
};
export const showError = (message = "Operation Failed") => {
  toast.error(message);
};

export const callToStore = async (data: unknown) => {
  // const setUser = authStore.getState().setUser;
  // const setCategories = appStore.getState().setCategories;
  // const setLimit = appStore.getState().setLimit;
  // setUser(data);
  // await setCategoryFromAPI(setCategories);
  // await setLimitFromAPI(setLimit,data);//here jo bhi currency hoga usme INR to current cuurency mein convert krna hoga
  console.log('Store functionality not implemented yet:', data);
};

export const useHandleResponse = () => {
  const router = useRouter();

  const Response = ({ response, successCode = 201 }: { response: { message: string; statusCode: number }, successCode?: number }) => {
    const { message, statusCode } = response;

    if (statusCode === successCode) {
      showSuccess("Changes Saved");
      setTimeout(() => router.push("/dashboard/home"), 3000);
      return true;
    } else {
      showError(message || "Something went wrong");
      return false;
    }
  };

  return Response;
};

export const getDiffCategories = (oldList: string[], newList: string[]) => {
  return {
    added: newList.filter((item: string) => !oldList.includes(item)),
    removed: oldList.filter((item: string) => !newList.includes(item)),
  };
};

export function getLastSixMonths() {
  const currentMonth = new Date().getMonth();
  const result = [];

  for (let i = 1; i <= 6; i++) {
    const index = (currentMonth - i + 12) % 12;
    result.push(MONTHS[index]);
  }

  return result;
}

export const categoryIcons = {
  Food: <FaUtensils size={20} color="white" />,
  Shopping: <FaShoppingBag size={20} color="white" />,
  Transport: <FaCar size={20} color="white" />,
  Hotel: <FaHotel size={20} color="white" />,
};

export const convertCurrency = async (amount: number, to: string, from: string) => {
  try {
    if (to === from) return amount;
    if (amount === 0) return 0;
    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data?.rates?.[to]) {
      throw new Error("Conversion failed or invalid currency.");
    }

    return parseFloat(data.rates[to].toFixed(2));
  } catch (error) {
    console.error("Conversion error:", (error as Error).message);
    return 0;
  }
};
