"use client";

import React, { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { InputBox, Button, useToast } from "@/app/features/common/index";
import { signIn } from "next-auth/react"; // ✅ Import from NextAuth
import Link from "next/link";
import { User } from "@/app/types/appTypes";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { showSuccess, showError } = useToast();

  // validation schema with error messages
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .matches(/^\d+$/, "Password must contain digits only")
      .min(5, "Password must be at least 5 characters")
      .max(10, "Password must not exceed 10 characters")
      .required("Password is required"),
  });

  // handle sign in
  const handleSignIn = async (
    values: User,
    actions: FormikHelpers<User>
  ): Promise<void> => {
    try {
      if (loading) return;
      setLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard/home",
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        showError(
          res.error === "CredentialsSignin" ? "Login Failed" : res.error
        );
      } else {
        showSuccess("Login Successful");
        router.replace(res?.url || "/dashboard/home"); // redirect manually
      }
      actions.resetForm();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard/home" });
    } catch (err) {
      showError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };
  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4 text-foreground">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>

        <div className="mb-4 flex justify-center">
          <Button
            onClick={handleGoogleLogin}
            bgColor="bg-[#4285F4]"
            hoverColor="hover:bg-[#3367D6]"
            className="border px-4 w-full sm:w-[270px] flex items-center justify-center gap-2"
          >
            Sign in with Google
          </Button>
        </div>

        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="mx-4 text-muted font-semibold">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <Formik<User>
          initialValues={{ name: "", email: "", currency: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSignIn}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-6 gap-4 w-full">
                <InputBox
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                />
                <InputBox
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4"
                loading={loading}
              >
                Sign In
              </Button>
              <p className="md:text-base text-sm mt-2 text-center">
                New User?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignIn;
