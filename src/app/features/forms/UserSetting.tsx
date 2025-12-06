"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { InputBox, Button, useToast, useHandleResponse, SelectBox } from "@/app/features/common/index";
import { updateProfile } from "@/app/lib/auth";
import { User as UserIcon } from "lucide-react";
import { User } from "@/app/types/appTypes";
import { useSession } from "next-auth/react";
import { CURRENCIES } from "@/constants";

const UserSetting: React.FC = () => {
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const { showError } = useToast();
  const Response = useHandleResponse();
  const { data: session, update } = useSession();
  const t = useTranslations();

  const profileValidationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, t('forms.validation.nameAlphabetsOnly'))
      .min(3, t('forms.validation.nameMin3'))
      .max(50, t('forms.validation.nameMax50'))
      .required(t('forms.validation.nameRequired')),

    email: Yup.string().email(t('forms.validation.invalidEmail')).required(t('forms.validation.emailRequired')),

    currency: Yup.string()
      .oneOf(CURRENCIES, t('forms.validation.invalidCurrency'))
      .required(t('forms.validation.currencyRequired')),
  });

  const handleProfileSubmit = async (
    values: User
  ) => {
    if (profileLoading) return;
    setProfileLoading(true);

    try {
      const currentUser = session?.user;
      if (
        currentUser &&
        values.name === currentUser.name &&
        values.email === currentUser.email &&
        values.currency === currentUser.currency
      ) {
        showError(t('forms.messages.noChangesDetected'));
        return;
      }

      const response = await updateProfile({
        name: values.name!,
        email: values.email,
        currency: values.currency!,
      }, t);
      Response({ response, successMessage: t('forms.messages.success') });
      await update({ name: values.name, email: values.email, currency: values.currency });
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || t('forms.messages.errorOccurred'));
    } finally {
      setProfileLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Formik
        initialValues={{
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          currency: session?.user?.currency || "INR",
        }}
        validationSchema={profileValidationSchema}
        onSubmit={handleProfileSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit }) => (
          <div className="w-full max-w-[600px] bg-background p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-foreground" />
              {t('forms.titles.updateProfile')}
            </h2>
            <div className="flex flex-col gap-6">
              <InputBox name="name" label={t('forms.labels.enterName')} type="text" />
              <InputBox name="email" label={t('forms.labels.enterEmail')} type="email" />
              <SelectBox
                label={t('forms.labels.selectCurrency')}
                name="currency"
                options={CURRENCIES}
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} width="w-full" loading={profileLoading}>
                {t('forms.titles.updateProfile')}
              </Button>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default UserSetting;
