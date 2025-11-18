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
      .matches(/^[a-zA-Z\s]+$/, t('register.nameAlphabetsOnly'))
      .min(3, t('register.nameMinLength'))
      .max(50, t('register.nameMaxLength'))
      .required(t('register.nameRequired')),

    email: Yup.string().email(t('login.invalidEmail')).required(t('login.emailRequired')),

    password: Yup.string()
      .matches(/^\d+$/, t('login.passwordDigitsOnly'))
      .min(5, t('login.passwordMinLength'))
      .max(10, t('login.passwordMaxLength'))
      .required(t('login.passwordRequired')),
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
        <h1 className="text-2xl font-bold mb-6">{t('register.title')}</h1>
        <Formik<User>
          initialValues={{ name: "", email: "", password: "", currency: "INR" }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-6 gap-4 w-full">
                <InputBox
                  label={t('register.name')}
                  name="name"
                  placeholder={t('register.enterName')}
                />
                <InputBox
                  label={t('login.email')}
                  name="email"
                  type="email"
                  placeholder={t('login.enterEmail')}
                />
                <InputBox
                  label={t('login.password')}
                  name="password"
                  type="password"
                  placeholder={t('login.enterPassword')}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4"
                loading={loading}
              >
                {t('register.title')}
              </Button>
              <p className="md:text-base text-sm mt-2 text-center">
                {t('register.alreadyHaveAccount')}{" "}
                <Link href="/signin" className="font-semibold  hover:underline">
                  {t('login.title')}
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
