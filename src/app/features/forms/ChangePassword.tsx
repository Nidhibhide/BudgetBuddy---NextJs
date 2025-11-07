"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, Button, showError, useHandleResponse } from "@/app/features/common/index";
import { changePassword } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";
import { Lock } from "lucide-react";

const ChangePassword: React.FC = () => {
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const Response = useHandleResponse();

  const passwordBaseSchema = Yup.string()
    .matches(/^\d+$/, "Password must contain digits only")
    .min(5, "Password must be at least 5 characters")
    .max(10, "Password must not exceed 10 characters");

  const passwordValidationSchema = Yup.object().shape({
    OldPassword: passwordBaseSchema.notRequired(),

    NewPassword: Yup.string().when("OldPassword", {
      is: (val: string | undefined) => val && val.length > 0,
      then: () => passwordBaseSchema.required("New Password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref("NewPassword"), undefined], "Passwords must match")
      .when("OldPassword", {
        is: (val: string | undefined) => val && val.length > 0,
        then: () => passwordBaseSchema.required("Confirm Password is required"),
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
            <Button onClick={handleSubmit} width="w-full" loading={passwordLoading}>
              Change Password
            </Button>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default ChangePassword;