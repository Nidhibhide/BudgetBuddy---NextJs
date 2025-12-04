"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, TextareaBox, SelectBox, Button, useToast } from "@/app/features/common/index";
import { useSession } from "next-auth/react";
import { addRecurringPayment, editRecurringPayment } from "@/app/lib/recurringPayment";
import { AddRecurringPaymentProps } from "@/app/types/appTypes";
import type { RecurringPayment } from "@/app/types/appTypes";

const RecurringPaymentForm: React.FC<AddRecurringPaymentProps> = ({ open, onOpenChange, onPaymentAdded, payment }) => {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    nextDueDate: Yup.date()
      .required("Date is required")
      .min(new Date(), "Date cannot be in the past"),
    reminderDate: Yup.date()
      .required("Date is required")
      .min(new Date(), "Date cannot be in the past")
      .when('nextDueDate', (nextDueDate, schema) => nextDueDate ? schema.max(Yup.ref('nextDueDate'), 'Reminder date must be before next due date') : schema),
    title: Yup.string()
      .min(1, "Title must be at least 1 character")
      .max(100, "Title must be at most 100 characters")
      .required("Title is required"),
    description: Yup.string()
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must be at most 200 characters")
      .optional(),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    frequency: Yup.string()
      .oneOf(["Weekly", "Monthly", "Yearly"], "Invalid frequency")
      .required("Frequency is required"),
    status: Yup.string()
      .oneOf(["Active", "Inactive"], "Invalid status")
      .optional(),
  });

  const handleSubmit = async (values: RecurringPayment) => {
    setLoading(true);
    try {
      const response = payment?._id
        ? await editRecurringPayment(payment._id, values)
        : await addRecurringPayment(values);
      if (response.success) {
        showSuccess(response.message);
        onPaymentAdded(values);
        onOpenChange(false);
      } else {
        showError(response.message || "Error Occurred");
      }
    } catch {
      showError("Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {payment?._id ? "Edit Form" : "Add Form"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            nextDueDate: payment?.nextDueDate ? new Date(payment.nextDueDate).toISOString().split("T")[0] : "",
            reminderDate: payment?.reminderDate ? new Date(payment.reminderDate).toISOString().split("T")[0] : "",
            title: payment?.title || "",
            description: payment?.description || "",
            amount: payment?.amount || 1,
            frequency: payment?.frequency || "",
            status: payment?.status || "Active",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="nextDueDate" label="Next Due Date" type="date" />
              <InputBox name="reminderDate" label="Reminder Date" type="date" />
              <p className="text-sm text-gray-600 -mt-2">Notifications will start from this date</p>
              <InputBox name="title" label="Title" />
              <TextareaBox name="description" label="Description" />
              <InputBox name="amount" label={`Amount (${session?.user?.currency || 'INR'})`} type="number" />
              <SelectBox name="frequency" label="Frequency" options={["Weekly", "Monthly", "Yearly"]} />
              <SelectBox
                name="status"
                label="Status"
                options={["Active", "Inactive"]}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {payment?._id ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringPaymentForm;