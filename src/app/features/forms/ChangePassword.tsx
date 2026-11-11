"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputBox, Button, useToast, useHandleResponse } from "@/app/features/common/index";
import { changePassword } from "@/app/lib/auth";
import { User } from "@/app/types/appTypes";
import { Lock } from "lucide-react";

const ChangePassword: React.FC = () => {
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const { showError } = useToast();
  const Response = useHandleResponse();

  const passwordBaseSchema = Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .matches(/[A-Za-z]/, "Password must contain at least one letter")
    .matches(/\d/, "Password must contain at least one number");

  const passwordValidationSchema = Yup.object().shape({
    OldPassword: Yup.string().notRequired(),

    NewPassword: Yup.string().when("OldPassword", {
      is: (val: string | undefined) => val && val.length > 0,
      then: () => passwordBaseSchema.required("New password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref("NewPassword"), undefined], "Passwords must match")
      .when("OldPassword", {
        is: (val: string | undefined) => val && val.length > 0,
        then: () =>
          Yup.string().required("Confirm password is required"),
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
          showError("New password must be different from old password");
          setPasswordLoading(false);
          return;
        }
        const response = await changePassword({
          oldPassword: OldPassword,
          newPassword: NewPassword,
        });
        Response({ response, successMessage: "Success" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      showError(err.message || "An unexpected error occurred");
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
        <div className="w-full max-w-[600px] mx-auto bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Lock className="w-6 h-6 text-foreground" />
            Change Password
          </h2>
          <div className="flex flex-col gap-6">
            <InputBox
              name="OldPassword"
              label="Current Password"
              type="password"
            />
            <div className="w-full flex flex-col gap-1">
              <InputBox
                name="NewPassword"
                label="New Password"
                type="password"
              />
              <p className="text-sm text-red-500 px-0.5">
                At least 8 characters, with a letter and a number
              </p>
            </div>
            <InputBox
              name="ConfirmPassword"
              label="Confirm Password"
              type="password"
            />
          </div>
          <div className="mt-4">
            <Button onClick={handleSubmit} width="w-full" loading={passwordLoading}>
          Save
            </Button>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default ChangePassword;