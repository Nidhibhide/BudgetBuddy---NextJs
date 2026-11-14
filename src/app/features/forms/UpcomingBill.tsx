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
import { InputBox, TextareaBox, Button, useToast } from "@/app/features/common/index";
import { useSession } from "next-auth/react";
import { addUpcomingBill, editUpcomingBill } from "@/app/lib/upcomingBill";
import { AddUpcomingBillProps, UpcomingBill } from "@/app/types/appTypes";
import {
  daysBetween,
  formatDate,
  isDateNotPast,
  subtractDays,
  toDateInputValue,
} from "@/app/lib/dateUtils";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

type UpcomingBillFormValues = {
  dueDate: string;
  remindBeforeDays: number | "";
  title: string;
  description: string;
  amount: number;
};

const UpcomingBillForm: React.FC<AddUpcomingBillProps> = ({
  open,
  onOpenChange,
  onBillAdded,
  bill,
}) => {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!bill?._id;
  const currency = session?.user?.currency || "INR";

  const getInitialRemindDays = () => {
    if (bill?.dueDate && bill?.reminderDate) {
      return Math.max(0, daysBetween(bill.reminderDate, bill.dueDate));
    }
    return 1;
  };

  const validationSchema = Yup.object().shape({
    dueDate: Yup.date()
      .required("Due date is required")
      .min(startOfToday(), "Due date cannot be in the past"),
    remindBeforeDays: Yup.number()
      .typeError("Days before must be a number")
      .integer("Days before must be a whole number")
      .min(0, "Days before cannot be negative")
      .required("Days before is required")
      .test(
        "reminder-not-past",
        "Reminder would be in the past. Use fewer days.",
        function (days) {
          const { dueDate } = this.parent;
          if (!dueDate || days === undefined || days === null) {
            return true;
          }
          const reminder = subtractDays(dueDate, Number(days));
          return isDateNotPast(reminder);
        }
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
  });

  const handleSubmit = async (values: UpcomingBillFormValues) => {
    setLoading(true);
    try {
      const reminderDate = toDateInputValue(
        subtractDays(values.dueDate, Number(values.remindBeforeDays))
      );
      const payload: UpcomingBill = {
        dueDate: values.dueDate,
        reminderDate,
        title: values.title,
        description: values.description,
        amount: values.amount,
        status: bill?.status || "Unpaid",
      };
      const response = isEdit
        ? await editUpcomingBill(bill!._id!, payload)
        : await addUpcomingBill(payload);
      if (response.success) {
        showSuccess(response.message);
        onBillAdded(payload);
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
        <Formik<UpcomingBillFormValues>
          enableReinitialize
          initialValues={{
            dueDate: bill?.dueDate
              ? toDateInputValue(bill.dueDate)
              : "",
            remindBeforeDays: getInitialRemindDays(),
            title: bill?.title || "",
            description: bill?.description || "",
            amount: bill?.amount || 1,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, values }) => {
            const days =
              values.remindBeforeDays === ""
                ? null
                : Number(values.remindBeforeDays);
            const reminderPreview =
              values.dueDate && days !== null && !Number.isNaN(days) && days >= 0
                ? formatDate(subtractDays(values.dueDate, days))
                : null;

            return (
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputBox name="dueDate" label="Due Date" type="date" />
                <InputBox
                  name="remindBeforeDays"
                  label="Remind me (days before)"
                  type="number"
                  placeholder="e.g. 3"
                />
                <p className="text-sm text-muted-foreground -mt-2">
                  {reminderPreview
                    ? `We’ll remind you starting on ${reminderPreview}.`
                    : "Enter how many days before the due date to start reminders."}
                </p>
                <InputBox name="title" label="Title" />
                <TextareaBox name="description" label="Description" />
                <InputBox
                  name="amount"
                  label={`Amount (${currency})`}
                  type="number"
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
                  <Button
                    type="submit"
                    loading={loading}
                    text={isEdit ? "Updating..." : "Adding..."}
                  >
                    {isEdit ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default UpcomingBillForm;
