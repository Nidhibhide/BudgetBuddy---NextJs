"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, Button, showError, useHandleResponse, SelectBox } from "@/app/features/common/index";
import { updateProfile } from "@/app/lib/auth";
import { User as UserIcon } from "lucide-react";
import { User } from "@/app/types/appTypes";
import { useSession } from "next-auth/react";
import { CURRENCIES } from "@/lib/constants";

const UserSetting: React.FC = () => {
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const Response = useHandleResponse();
  const { data: session, update } = useSession();

  const profileValidationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name should not exceed 50 characters")
      .required("Name is required"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    currency: Yup.string()
      .oneOf(CURRENCIES, "Invalid currency")
      .required("Currency is required"),
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
        showError("No changes detected. Profile is already up to date.");
        return;
      }

      const response = await updateProfile({
        name: values.name!,
        email: values.email,
        currency: values.currency!,
      });
      Response({ response, successMessage: "Profile updated successfully" });
      await update({ name: values.name, email: values.email, currency: values.currency });
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || "Something went wrong.");
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
              Edit Profile
            </h2>
            <div className="flex flex-col gap-6">
              <InputBox name="name" label="Enter Your Name" type="text" />
              <InputBox name="email" label="Enter Your Email" type="email" />
              <SelectBox
                label="Select Currency"
                name="currency"
                options={CURRENCIES}
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} width="w-full" loading={profileLoading}>
                Update Profile
              </Button>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default UserSetting;
