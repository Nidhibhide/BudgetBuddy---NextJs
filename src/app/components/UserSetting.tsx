"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, Button, showError, useHandleResponse } from "./index";
import { changePassword, updateProfile } from "../lib/user";
import { UserFormValues } from "@/app/types/appTypes";
import { User, Lock } from "lucide-react";
import { useSession } from "next-auth/react";

const UserSetting: React.FC = () => {
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const Response = useHandleResponse();
  const { data: session, update } = useSession();

  const passwordBaseSchema = Yup.string()
    .matches(/^\d+$/, "Password must contain digits only")
    .min(5, "Password must be at least 5 characters")
    .max(10, "Password must not exceed 10 characters");

  const profileValidationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name should not exceed 50 characters")
      .required("Name is required"),

    email: Yup.string().email("Invalid email").required("Email is required"),
  }) as Yup.ObjectSchema<Pick<UserFormValues, "name" | "email">>;

  const passwordValidationSchema = Yup.object().shape({
    OldPassword: passwordBaseSchema.notRequired(),

    NewPassword: Yup.string().when("OldPassword", {
      is: (val: string | undefined) => val && val.length > 0,
      then: (schema) => passwordBaseSchema.required("New Password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref("NewPassword"), undefined], "Passwords must match")
      .when("OldPassword", {
        is: (val: string | undefined) => val && val.length > 0,
        then: (schema) => passwordBaseSchema.required("Confirm Password is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
  }) as Yup.ObjectSchema<
    Pick<UserFormValues, "OldPassword" | "NewPassword" | "ConfirmPassword">
  >;

  const handleProfileSubmit = async (
    values: Pick<UserFormValues, "name" | "email">
  ) => {
    if (profileLoading) return;
    setProfileLoading(true);

    try {
      const currentUser = session?.user;
      if (
        currentUser &&
        values.name === currentUser.name &&
        values.email === currentUser.email
      ) {
        showError("No changes detected. Profile is already up to date.");
        return;
      }

      const response = await updateProfile(values);
      Response({ response, successMessage: "Profile updated successfully" });
      await update({ name: values.name, email: values.email });
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || "Something went wrong.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (
    values: Pick<
      UserFormValues,
      "OldPassword" | "NewPassword" | "ConfirmPassword"
    >
  ) => {
    if (passwordLoading) return;
    setPasswordLoading(true);

    try {
      const { OldPassword, NewPassword } = values;
      if (OldPassword && NewPassword) {
        if (OldPassword === NewPassword) {
          showError("New password must be different from current password.");
          setPasswordLoading(false);
          return;
        }
        const response = await changePassword({
          oldPassword: OldPassword,
          newPassword: NewPassword,
        });
        Response({ response, successMessage: "Password changed successfully" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || "Something went wrong.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Formik
        initialValues={{
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        }}
        validationSchema={profileValidationSchema}
        onSubmit={handleProfileSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit }) => (
          <div className="w-full max-w-[600px] bg-background p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-foreground" />
              Edit Profile
            </h2>
            <div className="flex flex-col gap-6">
              <InputBox name="name" label="Enter Your Name" type="text" />
              <InputBox name="email" label="Enter Your Email" type="email" />
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} width="w-full">
                {profileLoading ? "Loading..." : "Update Profile"}
              </Button>
            </div>
          </div>
        )}
      </Formik>

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
          <div className="w-full max-w-[600px] bg-background p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Lock className="w-6 h-6 text-foreground" />
              Change Password
            </h2>
            <div className="flex flex-col gap-6">
              <InputBox
                name="OldPassword"
                label="Enter Current Password"
                type="password"
              />
              <InputBox
                name="NewPassword"
                label="Enter New Password"
                type="password"
              />
              <InputBox
                name="ConfirmPassword"
                label="Enter Confirm Password"
                type="password"
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} width="w-full">
                {passwordLoading ? "Loading..." : "Change Password"}
              </Button>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default UserSetting;
