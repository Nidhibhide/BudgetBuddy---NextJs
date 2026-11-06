"use client";

import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, Button, useToast } from "@/app/features/common/index";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, verifyResetToken } from "@/app/lib/auth";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState(
    "Please enter and confirm your new password."
  );
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsValid(false);
        setMessage("Reset link is invalid or missing.");
        setVerifying(false);
        return;
      }

      try {
        const response = await verifyResetToken(token);
        if (response.success) {
          setIsValid(true);
        } else {
          setIsValid(false);
          setMessage(response.message || "Reset link expired or invalid");
        }
      } catch {
        setIsValid(false);
        setMessage("Failed to verify reset link");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .matches(/[A-Za-z]/, "Password must contain at least one letter")
      .matches(/\d/, "Password must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleResetPassword = async (
    values: { password: string; confirmPassword: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      if (loading || !token) return;
      setLoading(true);

      const response = await resetPassword({
        token,
        newPassword: values.password,
      });

      if (response.success) {
        showSuccess(response.message || "Password reset successfully");
        resetForm();
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        showError(response.message || "Failed to reset password");
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex justify-center items-center p-4 text-foreground">
      <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 sm:p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-muted text-center mb-6">{message}</p>

        {verifying ? (
          <p className="text-sm">Verifying reset link...</p>
        ) : !isValid ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <Button
              onClick={() => router.push("/forgot-password")}
              className="w-full"
            >
              Send Again
            </Button>
            <Link
              href="/signin"
              className="font-semibold text-primary hover:underline text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleResetPassword}
          >
            {({ handleSubmit }) => (
              <>
                <div className="flex flex-col mb-6 gap-4 w-full">
                  <InputBox
                    label="New Password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  <InputBox
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-4"
                  loading={loading}
                >
                  Reset Password
                </Button>
              </>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
