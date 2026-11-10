"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, Button, useToast } from "@/app/features/common/index";
import Link from "next/link";
import { forgotPassword } from "@/app/lib/auth";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const handleForgotPassword = async (
    values: { email: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      const response = await forgotPassword(values);

      if (response.success) {
        showSuccess(response.message || "Reset link sent to your email");
        resetForm();
      } else {
        showError(response.message || "Failed to send reset link");
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex justify-center items-center p-4 text-foreground">
      <div className="w-full max-w-md bg-card border-2 border-border rounded-2xl shadow-[0_12px_40px_rgba(99,102,241,0.18)] p-4 sm:p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email to receive reset instructions.
        </p>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={handleForgotPassword}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-6 gap-4 w-full">
                <InputBox
                  label="Enter Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4"
                loading={loading}
              >
                Send Reset Link
              </Button>

              <p className="md:text-base text-sm mt-4 text-center text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-btn-background hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword;
