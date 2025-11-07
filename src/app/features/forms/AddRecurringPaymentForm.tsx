"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, TextareaBox, SelectBox, Button } from "@/app/features/common/index";
import { useSession } from "next-auth/react";

interface AddRecurringPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded: (data: { title: string; amount: number; frequency: string; nextDueDate: string; reminderDate: string; description?: string; status?: string }) => void;
}

const AddRecurringPaymentForm: React.FC<AddRecurringPaymentFormProps> = ({ open, onOpenChange, onPaymentAdded }) => {
  const { data: session } = useSession();
  const validationSchema = Yup.object().shape({
    nextDueDate: Yup.date()
      .required("Next Due Date is required")
      .min(new Date(), "Next Due Date cannot be in the past"),
    reminderDate: Yup.date()
      .required("Reminder Date is required")
      .min(new Date(), "Reminder Date cannot be in the past")
      .when('nextDueDate', (nextDueDate, schema) => nextDueDate ? schema.max(Yup.ref('nextDueDate'), 'Reminder date must be before next due date') : schema),
    title: Yup.string()
      .min(1, "Title must be at least 1 character")
      .max(100, "Title must not exceed 100 characters")
      .required("Title is required"),
    description: Yup.string()
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must not exceed 200 characters")
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

  const handleSubmit = (values: { title: string; amount: number; frequency: string; nextDueDate: string; reminderDate: string; description?: string; status?: string }) => {
    onPaymentAdded(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Recurring Payment
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            nextDueDate: "",
            reminderDate: "",
            title: "",
            description: "",
            amount: 1,
            frequency: "",
            status: "Active",
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
              <TextareaBox name="description" label="Description (Optional)" />
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
                <Button type="submit">
                  Add Payment
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecurringPaymentForm;