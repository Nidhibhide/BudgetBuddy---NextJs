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
import { InputBox, TextareaBox, SelectBox, Button, showSuccess, showError } from "@/app/features/common/index";
import { addUpcomingBill, editUpcomingBill } from "@/app/lib/upcomingBill";
import { AddUpcomingBillProps, UpcomingBill } from "@/app/types/appTypes";

const UpcomingBillForm: React.FC<AddUpcomingBillProps> = ({ open, onOpenChange, onBillAdded, bill }) => {
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (values: UpcomingBill) => {
    setLoading(true);
    try {
      const response = bill?._id
        ? await editUpcomingBill(bill._id, values)
        : await addUpcomingBill(values);
      if (response.success) {
        showSuccess(response.message);
        onBillAdded(values);
        onOpenChange(false);
      } else {
        showError(response.message || `Failed to ${bill?._id ? 'update' : 'add'} upcoming bill`);
      }
    } catch {
      showError(`Something went wrong while ${bill?._id ? 'updating' : 'adding'} upcoming bill`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {bill?._id ? "Edit Upcoming Bill" : "Add Upcoming Bill"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            dueDate: bill?.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : "",
            reminderDate: bill?.reminderDate ? new Date(bill.reminderDate).toISOString().split("T")[0] : "",
            title: bill?.title || "",
            description: bill?.description || "",
            amount: bill?.amount || 1,
            status: bill?.status || "Unpaid",
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
                <Button type="submit" loading={loading}>
                  {bill?._id ? "Update Bill" : "Add Bill"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default UpcomingBillForm;