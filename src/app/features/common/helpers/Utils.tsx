"use client";

import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const useToast = () => {
  const showSuccess = (message?: string) => {
    toast.success(message || "Success");
  };

  const showError = (message?: string) => {
    toast.error(message || "Error Occurred");
  };

  return { showSuccess, showError };
};

export const useHandleResponse = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const Response = ({
    response,
    successMessage,
  }: {
    response: { message: string; statusCode: number; success: boolean };
    successMessage?: string;
  }) => {
    const { message, success } = response;
    const defaultSuccessMessage = "Success";
    const defaultErrorMessage = "Error Occurred";

    if (success) {
      showSuccess(successMessage || defaultSuccessMessage);
      setTimeout(() => router.push("/dashboard/home"), 3000);
      return true;
    } else {
      showError(message || defaultErrorMessage);
      return false;
    }
  };

  return Response;
};

import { FieldDisplayProps } from "@/app/types/appTypes";

export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  label,
  value,
  labelWidth = "w-[110px]",
  valueClassName = "",
}) => (
  <div className="flex items-center gap-1">
    <span className={`text-base font-bold px-2 py-1 rounded ${labelWidth} text-left`}>
      {label}:
    </span>
    <span className={valueClassName}>{value}</span>
  </div>
);
