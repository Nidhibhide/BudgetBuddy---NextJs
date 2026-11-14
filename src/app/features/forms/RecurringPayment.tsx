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
import {
  InputBox,
  TextareaBox,
  SelectBox,
  Button,
  useToast,
} from "@/app/features/common/index";
import { useSession } from "next-auth/react";
import {
  addRecurringPayment,
  editRecurringPayment,
} from "@/app/lib/recurringPayment";
import { AddRecurringPaymentProps } from "@/app/types/appTypes";
import type { RecurringPayment } from "@/app/types/appTypes";
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

type RecurringPaymentFormValues = {
  nextDueDate: string;
  remindBeforeDays: number | "";
  title: string;
  description: string;
  amount: number;
  frequency: string;
};

const RecurringPaymentForm: React.FC<AddRecurringPaymentProps> = ({
  open,
  onOpenChange,
  onPaymentAdded,
  payment,
}) => {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!payment?._id;
  const currency = session?.user?.currency || "INR";

  const getInitialRemindDays = () => {
    if (payment?.nextDueDate && payment?.reminderDate) {
      return Math.max(
        0,
        daysBetween(payment.reminderDate, payment.nextDueDate)
      );
    }
    return 1;
  };

  const validationSchema = Yup.object().shape({
    nextDueDate: Yup.date()
      .required("Next due date is required")
      .min(startOfToday(), "Next due date cannot be in the past"),
    remindBeforeDays: Yup.number()
      .typeError("Days before must be a number")
      .integer("Days before must be a whole number")
      .min(0, "Days before cannot be negative")
      .required("Days before is required")
      .test(
        "reminder-not-past",
        "Reminder would be in the past. Use fewer days.",
        function (days) {
          const { nextDueDate } = this.parent;
          if (!nextDueDate || days === undefined || days === null) {
            return true;
          }
          const reminder = subtractDays(nextDueDate, Number(days));
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
    frequency: Yup.string()
      .oneOf(["Weekly", "Monthly", "Yearly"], "Invalid frequency")
      .required("Frequency is required"),
  });

  const handleSubmit = async (values: RecurringPaymentFormValues) => {
    setLoading(true);
    try {
      const reminderDate = toDateInputValue(
        subtractDays(values.nextDueDate, Number(values.remindBeforeDays))
      );
      const payload: RecurringPayment = {
        nextDueDate: values.nextDueDate,
        reminderDate,
        title: values.title,
        description: values.description,
        amount: values.amount,
        frequency: values.frequency,
        status: payment?.status || "Active",
      };
      const response = isEdit
        ? await editRecurringPayment(payment!._id!, payload)
        : await addRecurringPayment(payload);
      if (response.success) {
        showSuccess(response.message);
        onPaymentAdded(payload);
        onOpenChange(false);
      } else {
        showError(
          response.message || "Couldn’t save this payment. Please try again."
        );
      }
    } catch {
      showError("Couldn’t save this payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Edit Recurring Payment" : "Add Recurring Payment"}
          </DialogTitle>
        </DialogHeader>
        <Formik<RecurringPaymentFormValues>
          enableReinitialize
          initialValues={{
            nextDueDate: payment?.nextDueDate
              ? toDateInputValue(payment.nextDueDate)
              : "",
            remindBeforeDays: getInitialRemindDays(),
            title: payment?.title || "",
            description: payment?.description || "",
            amount: payment?.amount || 1,
            frequency: payment?.frequency || "",
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
              values.nextDueDate &&
              days !== null &&
              !Number.isNaN(days) &&
              days >= 0
                ? formatDate(subtractDays(values.nextDueDate, days))
                : null;

            return (
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputBox
                  name="nextDueDate"
                  label="Next Due Date"
                  type="date"
                />
                <InputBox
                  name="remindBeforeDays"
                  label="Remind me (days before)"
                  type="number"
                  placeholder="e.g. 3"
                />
                <p className="text-sm text-muted-foreground -mt-2">
                  {reminderPreview
                    ? `We’ll remind you starting on ${reminderPreview}.`
                    : "Enter how many days before the next due date to start reminders."}
                </p>
                <InputBox name="title" label="Title" />
                <TextareaBox name="description" label="Description" />
                <InputBox
                  name="amount"
                  label={`Amount (${currency})`}
                  type="number"
                />
                <SelectBox
                  name="frequency"
                  label="Frequency"
                  options={["Weekly", "Monthly", "Yearly"]}
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

export default RecurringPaymentForm;
