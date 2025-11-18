"use client";

import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const showSuccess = (message = "Operation Success") => {
  toast.success(message);
};
export const showError = (message = "Operation Failed") => {
  toast.error(message);
};

export const useHandleResponse = () => {
  const router = useRouter();

  const Response = ({
    response,
    successMessage = "Changes Saved",
  }: {
    response: { message: string; statusCode: number; success: boolean };
    successMessage?: string;
  }) => {
    const { message, success } = response;

    if (success) {
      showSuccess(successMessage);
      setTimeout(() => router.push("/dashboard/home"), 3000);
      return true;
    } else {
      showError(message || "Something went wrong");
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
