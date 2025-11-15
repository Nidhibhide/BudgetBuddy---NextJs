"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, showError, showSuccess, Button } from "@/app/features/common/index";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";
import { useTranslations } from 'next-intl'; // Import for internationalization


const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get translation function for the 'auth' namespace
  // This provides access to all authentication-related translations
  const t = useTranslations('auth');

  // validation schema with translated error messages
  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, t('nameAlphabetsOnly'))
      .min(3, t('nameMinLength'))
      .max(50, t('nameMaxLength'))
      .required(t('nameRequired')),

    email: Yup.string().email(t('invalidEmail')).required(t('emailRequired')),

    password: Yup.string()
      .matches(/^\d+$/, t('passwordDigitsOnly'))
      .min(5, t('passwordMinLength'))
      .max(10, t('passwordMaxLength'))
      .required(t('passwordRequired')),
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
        <h1 className="text-2xl font-bold mb-6">{t('signUp')}</h1>
        <Formik<User>
          initialValues={{ name: "", email: "", password: "", currency: "INR" }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-6 gap-4 w-full">
                <InputBox
                  label={t('name')}
                  name="name"
                  placeholder={t('enterName')}
                />
                <InputBox
                  label={t('email')}
                  name="email"
                  type="email"
                  placeholder={t('enterEmail')}
                />
                <InputBox
                  label={t('password')}
                  name="password"
                  type="password"
                  placeholder={t('enterPassword')}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4"
                loading={loading}
              >
                {t('signUp')}
              </Button>
              <p className="md:text-base text-sm mt-2 text-center">
                {t('alreadyHaveAccount')}{" "}
                <Link href="/signin" className="font-semibold  hover:underline">
                  {t('signIn')}
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
