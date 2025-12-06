"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { InputBox, useToast, Button } from "@/app/features/common/index";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const { showSuccess, showError } = useToast();

  // validation schema with error messages
  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, t("forms.validation.nameAlphabetsOnly"))
      .min(3, t("forms.validation.nameMin3"))
      .max(50, t("forms.validation.nameMax50"))
      .required(t("forms.validation.nameRequired")),

    email: Yup.string().email(t("forms.validation.invalidEmail")).required(t("forms.validation.emailRequired")),

    password: Yup.string()
      .matches(/^(?=.*\d)/, t("forms.validation.passwordDigitsOnly"))
      .min(5, t("forms.validation.passwordMin5"))
      .max(10, t("forms.validation.passwordMax10"))
      .required(t("forms.validation.newPasswordRequired")),
  });

  // handle sign up
  const handleSignUp = async (
    values: User,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      const response = await registerUser(values, t);

      const { message, statusCode } = response;

      if (statusCode === 201) {
        showSuccess(message);
        setTimeout(() => router.push("/signin"), 3000);
      } else if (message) {
        showError(message);
      }
      resetForm();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-foreground flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-background  rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">{t("pages.public.signup.title")}</h1>
        <Formik<User>
          initialValues={{ name: "", email: "", password: "", currency: "INR" }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleSubmit }) => (
            <>
              <div className="flex flex-col mb-6 gap-4 w-full">
                <InputBox
                  label={t("forms.labels.enterName")}
                  name="name"
                  placeholder={t("pages.public.signup.placeholders.name")}
                />
                <InputBox
                  label={t("forms.labels.enterEmail")}
                  name="email"
                  type="email"
                  placeholder={t("pages.public.signup.placeholders.email")}
                />
                <InputBox
                  label={t("forms.labels.newPassword")}
                  name="password"
                  type="password"
                  placeholder={t("pages.public.signup.placeholders.password")}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4"
                loading={loading}
              >
                {t("pages.public.signup.buttons.signup")}
              </Button>
              <p className="md:text-base text-sm mt-2 text-center">
                {t("pages.public.signup.links.alreadyHaveAccount")}{" "}
                <Link href="/signin" className="font-semibold  hover:underline">
                  {t("pages.public.signin.buttons.signin")}
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
