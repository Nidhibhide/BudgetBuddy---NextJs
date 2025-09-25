'use client';

import React, { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { InputBox, Button, showError, showSuccess } from "@/app/components";
import { signInUser } from "@/app/lib/user";
import Link from "next/link";
// import { GoogleLogin } from "@react-oauth/google";
// import { callToStore } from "../../../components";
// import { authStore } from "../../../store";
import { SignInFormValues } from "../../types";

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  // const setUser = authStore((state) => state.setUser);
  // const router = useRouter();

  // validation schema
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
    values: SignInFormValues,
    actions: FormikHelpers<SignInFormValues>
  ): Promise<void> => {
    try {
      if (loading) return;
      setLoading(true);
      const signinRes = await signInUser(values);

      const { message: signinMsg, statusCode: signinStatus } = signinRes;

      if (signinStatus === 200) {
        showSuccess(signinMsg);

        // const userRes = await getMe();
        // const { statusCode: getMeStatus, data } = userRes;
        // if (getMeStatus === 200) {
        //   // callToStore(data);
        // }
        // setTimeout(() => router.push("/dashboard/home"), 3000);
      } else if (signinMsg) {
        showError(signinMsg);
      }
      actions.resetForm();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  //handle sign in with google
  // const handleGoogleLogin = async (values) => {
  //   try {
  //     const token = values?.credential;

  //     // const res = await signinwithGoogle(token);
  //     const { message: signinMsg, statusCode: signinStatus } = res;

  //     if (signinStatus === 200) {
  //       showSuccess(signinMsg);

  //       const userRes = await getMe();
  //       const { statusCode: getMeStatus, data } = userRes;
  //       if (getMeStatus === 200) {
  //         callToStore(data);
  //       }
  //       setTimeout(() => router.push("/dashboard/home"), 3000);
  //     } else if (signinMsg) {
  //       showError(signinMsg);
  //     }
  //   } catch (err) {
  //     showError(err.message);
  //   }
  // };

  return (
    <div className=" bg-[#ffffff] dark:bg-[#000000] text-[#0f172a] dark:text-[#f8fafc] h-full w-full flex justify-center">
      <div className="w-[500px] h-fit  flex flex-col items-center py-8 px-12 md:mt-20 md:bg-[#f1f5f9] md:dark:bg-[#1e293b] ">
        <div className="mb-4 flex justify-center ">
          {/* <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => showError("Google Login failed")}
            theme="filled_blue"
            size="large"
            text="continue_with"
            width="270"
          /> */}
        </div>

        <div className="flex items-center">
          <div className=" flex-1 "></div>
          <span className="mx-4  font-semibold">OR</span>
          <div className=" flex-1 "></div>
        </div>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSignIn}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-12 gap-3 w-full">
                <InputBox name="email" label="Enter your Email" type="email" />
                <InputBox
                  name="password"
                  label="Enter your Password"
                  type="password"
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Loading..." : "Sign In"}
              </Button>
              <p className="md:text-base text-sm ">
                New User?{" "}
                <Link href="/signup" className="font-semibold  hover:underline">
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
