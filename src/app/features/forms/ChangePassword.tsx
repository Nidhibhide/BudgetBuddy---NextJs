"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from 'next-intl';
import { InputBox, Button, showError, useHandleResponse } from "@/app/features/common/index";
import { changePassword } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";
import { Lock } from "lucide-react";

const ChangePassword: React.FC = () => {
  const t = useTranslations();
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const Response = useHandleResponse();

  const passwordBaseSchema = Yup.string()
    .matches(/^\d+$/, t('auth.login.passwordDigitsOnly'))
    .min(5, t('auth.login.passwordMinLength'))
    .max(10, t('auth.login.passwordMaxLength'));

  const passwordValidationSchema = Yup.object().shape({
    OldPassword: passwordBaseSchema.notRequired(),

    NewPassword: Yup.string().when("OldPassword", {
      is: (val: string | undefined) => val && val.length > 0,
      then: () => passwordBaseSchema.required(t('auth.changePassword.newPasswordRequired')),
      otherwise: (schema) => schema.notRequired(),
    }),

    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref("NewPassword"), undefined], t('auth.changePassword.passwordsMustMatch'))
      .when("OldPassword", {
        is: (val: string | undefined) => val && val.length > 0,
        then: () => passwordBaseSchema.required(t('auth.changePassword.confirmPasswordRequired')),
        otherwise: (schema) => schema.notRequired(),
      }),
  }) as Yup.ObjectSchema<
    Pick<User, "OldPassword" | "NewPassword" | "ConfirmPassword">
  >;

  const handlePasswordSubmit = async (
    values: Pick<
      User,
      "OldPassword" | "NewPassword" | "ConfirmPassword"
    >
  ) => {
    if (passwordLoading) return;
    setPasswordLoading(true);

    try {
      const { OldPassword, NewPassword } = values;
      if (OldPassword && NewPassword) {
        if (OldPassword === NewPassword) {
          showError(t('auth.changePassword.newPasswordDifferent'));
          setPasswordLoading(false);
          return;
        }
        const response = await changePassword({
          oldPassword: OldPassword,
          newPassword: NewPassword,
        });
        Response({ response, successMessage: t('auth.changePassword.success') });
      }
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || t('auth.changePassword.error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        OldPassword: "",
        NewPassword: "",
        ConfirmPassword: "",
      }}
      validationSchema={passwordValidationSchema}
      onSubmit={handlePasswordSubmit}
    >
      {({ handleSubmit }) => (
        <div className="w-full max-w-[600px] mx-auto bg-background p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Lock className="w-6 h-6 text-foreground" />
            {t('dashboard.profile.changePassword')}
          </h2>
          <div className="flex flex-col gap-6">
            <InputBox
              name="OldPassword"
              label={t('dashboard.profile.currentPasswordLabel')}
              type="password"
            />
            <InputBox
              name="NewPassword"
              label={t('dashboard.profile.newPasswordLabel')}
              type="password"
            />
            <InputBox
              name="ConfirmPassword"
              label={t('dashboard.profile.confirmPasswordLabel')}
              type="password"
            />
          </div>
          <div className="mt-4">
            <Button onClick={handleSubmit} width="w-full" loading={passwordLoading}>
              {t('dashboard.profile.changePassword')}
            </Button>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default ChangePassword;