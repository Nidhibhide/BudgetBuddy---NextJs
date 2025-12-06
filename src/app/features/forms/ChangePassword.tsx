"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { InputBox, Button, useToast, useHandleResponse } from "@/app/features/common/index";
import { changePassword } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";
import { Lock } from "lucide-react";

const ChangePassword: React.FC = () => {
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const { showError } = useToast();
  const Response = useHandleResponse();
  const t = useTranslations();

  const passwordBaseSchema = Yup.string()
    .matches(/^\d+$/, t('forms.validation.passwordDigitsOnly'))
    .min(5, t('forms.validation.passwordMin5'))
    .max(10, t('forms.validation.passwordMax10'));

  const passwordValidationSchema = Yup.object().shape({
    OldPassword: passwordBaseSchema.notRequired(),

    NewPassword: Yup.string().when("OldPassword", {
      is: (val: string | undefined) => val && val.length > 0,
      then: () => passwordBaseSchema.required(t('forms.validation.newPasswordRequired')),
      otherwise: (schema) => schema.notRequired(),
    }),

    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref("NewPassword"), undefined], t('forms.validation.passwordsMustMatch'))
      .when("OldPassword", {
        is: (val: string | undefined) => val && val.length > 0,
        then: () => passwordBaseSchema.required(t('forms.validation.confirmPasswordRequired')),
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
          showError(t('forms.messages.newPasswordDifferent'));
          setPasswordLoading(false);
          return;
        }
        const response = await changePassword({
          oldPassword: OldPassword,
          newPassword: NewPassword,
        }, t);
        Response({ response, successMessage: t('forms.messages.success') });
      }
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || t('forms.messages.errorOccurred'));
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
            {t('forms.titles.changePassword')}
          </h2>
          <div className="flex flex-col gap-6">
            <InputBox
              name="OldPassword"
              label={t('forms.labels.currentPassword')}
              type="password"
            />
            <InputBox
              name="NewPassword"
              label={t('forms.labels.newPassword')}
              type="password"
            />
            <InputBox
              name="ConfirmPassword"
              label={t('forms.labels.confirmPassword')}
              type="password"
            />
          </div>
          <div className="mt-4">
            <Button onClick={handleSubmit} width="w-full" loading={passwordLoading}>
          {t('forms.buttons.save')}
            </Button>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default ChangePassword;