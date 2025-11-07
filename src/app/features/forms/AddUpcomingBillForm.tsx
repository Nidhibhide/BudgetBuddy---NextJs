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

interface AddUpcomingBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBillAdded: (data: { dueDate: string; title: string; description: string; amount: number; reminderDate: string; status?: string }) => void;
}

const AddUpcomingBillForm: React.FC<AddUpcomingBillFormProps> = ({ open, onOpenChange, onBillAdded }) => {
  const validationSchema = Yup.object().shape({
    dueDate: Yup.date()
      .required("Due Date is required")
      .min(new Date(), "Due Date cannot be in the past"),
    reminderDate: Yup.date()
      .required("Reminder Date is required")
      .min(new Date(), "Reminder Date cannot be in the past")
      .when('dueDate', (dueDate, schema) => dueDate ? schema.max(Yup.ref('dueDate'), 'Reminder date must be before due date') : schema),
    title: Yup.string()
      .min(1, "Title must be at least 1 character")
      .max(100, "Title must not exceed 100 characters")
      .required("Title is required"),
    description: Yup.string()
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must not exceed 200 characters")
      .required("Description is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    status: Yup.string()
      .oneOf(["Paid", "Unpaid"], "Invalid status")
      .optional(),
  });

  const handleSubmit = (values: { dueDate: string; title: string; description: string; amount: number; reminderDate: string; status?: string }) => {
    onBillAdded(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Upcoming Bill
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            dueDate: "",
            reminderDate: "",
            title: "",
            description: "",
            amount: 1,
            status: "Unpaid",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="dueDate" label="Due Date" type="date" />
              <InputBox name="reminderDate" label="Reminder Date" type="date" />
              <p className="text-sm text-gray-600 -mt-2">Notifications will start from this date</p>
              <InputBox name="title" label="Title" />
              <TextareaBox name="description" label="Description" />
              <InputBox name="amount" label="Amount" type="number" />
              <SelectBox
                name="status"
                label="Status"
                options={["Unpaid", "Paid"]}
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
                  Add Bill
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddUpcomingBillForm;