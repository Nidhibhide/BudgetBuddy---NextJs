"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, showError, showSuccess, Button } from "@/app/features/common/index";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";


const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name should not exceed 50 characters")
      .required("Name is required"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    password: Yup.string()
      .matches(/^\d+$/, "Password must contain digits only")
      .min(5, "Password must be at least 5 characters")
      .max(10, "Password must not exceed 10 characters")
      .required("Password is required"),
  });

  // handle sign up
  const handleSignUp = async (
    values: User,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      const response = await registerUser(values);

      const { message, statusCode } = response;

      if (statusCode === 201) {
        showSuccess(message);
        setTimeout(() => router.push("/signin"), 3000);
      } else if (message) {
        showError(message);
      }
      resetForm();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-foreground flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-background  rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        <Formik<User>
          initialValues={{ name: "", email: "", password: "", currency: "INR" }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-6 gap-4 w-full">
                <InputBox
                  label="Name"
                  name="name"
                  placeholder="Enter your name"
                />
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
                Sign Up
              </Button>
              <p className="md:text-base text-sm mt-2 text-center">
                Already have an account?{" "}
                <Link href="/signin" className="font-semibold  hover:underline">
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

export default SignUp;
