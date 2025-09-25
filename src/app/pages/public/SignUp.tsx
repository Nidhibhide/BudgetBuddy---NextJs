'use client';

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, showError, showSuccess, Button } from "../../components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "../../lib/user";
import { RegisterUserData } from "@/app/types"

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
  const handleSignUp = async (values: RegisterUserData , { resetForm }: { resetForm: () => void }) => {
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
      showError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-[#ffffff] dark:bg-[#000000] text-[#0f172a] dark:text-[#f8fafc] h-full w-full flex justify-center">
      <div className="w-[500px] h-fit md:bg-[#f1f5f9] md:dark:bg-[#1e293b] flex flex-col items-center py-6 px-12 md:mt-20">
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-12 gap-3 w-full">
                <InputBox name="name" label="Enter your Name" type="text"/>
                <InputBox name="email" label="Enter your Email" type="email" />
                <InputBox
                  name="password"
                  label="Enter your Password"
                  type="password"
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Loading..." : "Sign Up"}
              </Button>
              <p className="md:text-base text-sm ">
                Back to{" "}
                <Link href="/" className="font-semibold  hover:underline">
                  Home
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
