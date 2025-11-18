"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from 'next-intl';
import { InputBox, Button, showError, useHandleResponse, SelectBox } from "@/app/features/common/index";
import { updateProfile } from "@/app/lib/auth";
import { User as UserIcon } from "lucide-react";
import { User } from "@/app/types/appTypes";
import { useSession } from "next-auth/react";
import { CURRENCIES } from "@/constants";

const UserSetting: React.FC = () => {
  const t = useTranslations();
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const Response = useHandleResponse();
  const { data: session, update } = useSession();

  const profileValidationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, t('auth.register.nameAlphabetsOnly'))
      .min(3, t('auth.register.nameMinLength'))
      .max(50, t('auth.register.nameMaxLength'))
      .required(t('auth.register.nameRequired')),

    email: Yup.string().email(t('auth.login.invalidEmail')).required(t('auth.login.emailRequired')),

    currency: Yup.string()
      .oneOf(CURRENCIES, t('form.currency.invalid'))
      .required(t('form.currency.required')),
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
        showError(t('form.profile.noChanges'));
        return;
      }

      const response = await updateProfile({
        name: values.name!,
        email: values.email,
        currency: values.currency!,
      });
      Response({ response, successMessage: t('form.profile.success') });
      await update({ name: values.name, email: values.email, currency: values.currency });
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || t('form.profile.error'));
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
              {t('dashboard.profile.editProfile')}
            </h2>
            <div className="flex flex-col gap-6">
              <InputBox name="name" label={t('auth.register.enterName')} type="text" />
              <InputBox name="email" label={t('auth.login.enterEmail')} type="email" />
              <SelectBox
                label={t('form.currency.selectLabel')}
                name="currency"
                options={CURRENCIES}
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} width="w-full" loading={profileLoading}>
                {t('form.profile.updateButton')}
              </Button>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default UserSetting;
