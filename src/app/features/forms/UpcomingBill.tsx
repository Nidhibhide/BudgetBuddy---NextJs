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
import { addUpcomingBill, editUpcomingBill } from "@/app/lib/upcomingBill";
import { AddUpcomingBillProps, UpcomingBill } from "@/app/types/appTypes";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const UpcomingBillForm: React.FC<AddUpcomingBillProps> = ({
  open,
  onOpenChange,
  onBillAdded,
  bill,
}) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!bill?._id;

  const validationSchema = Yup.object().shape({
    dueDate: Yup.date()
      .required("Due date is required")
      .min(startOfToday(), "Due date cannot be in the past"),
    reminderDate: Yup.date()
      .required("Reminder date is required")
      .min(startOfToday(), "Reminder date cannot be in the past")
      .when("dueDate", (dueDate, schema) =>
        dueDate
          ? schema.max(
              Yup.ref("dueDate"),
              "Reminder date must be on or before due date"
            )
          : schema
      ),
    title: Yup.string()
      .min(1, "Title must be at least 1 character")
      .max(100, "Title must be at most 100 characters")
      .required("Title is required"),
    description: Yup.string()
      .transform((value) => (value === "" ? undefined : value))
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must be at most 200 characters")
      .optional(),
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
      const response = isEdit
        ? await editUpcomingBill(bill!._id!, values)
        : await addUpcomingBill(values);
      if (response.success) {
        showSuccess(response.message);
        onBillAdded(values);
        onOpenChange(false);
      } else {
        showError(response.message || "Couldn’t save this bill. Please try again.");
      }
    } catch {
      showError("Couldn’t save this bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Edit Upcoming Bill" : "Add Upcoming Bill"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={{
            dueDate: bill?.dueDate
              ? new Date(bill.dueDate).toISOString().split("T")[0]
              : "",
            reminderDate: bill?.reminderDate
              ? new Date(bill.reminderDate).toISOString().split("T")[0]
              : "",
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
              <p className="text-sm text-muted-foreground -mt-2">
                We’ll remind you starting on this date.
              </p>
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
                  bgColor="bg-muted border border-border dark:border-white/20"
                  hoverColor="hover:bg-muted/80"
                  className="text-foreground"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {isEdit ? "Update" : "Add"}
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
