"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/app/lib/dateUtils";
import { FieldDisplay } from "@/app/features/common";

import { ViewRecurringPaymentProps } from "@/app/types/appTypes";

const ViewRecurringPayment: React.FC<ViewRecurringPaymentProps> = ({
  open,
  onOpenChange,
  payment,
}) => {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>{payment.title}</DialogTitle>
          <DialogDescription>Recurring Payment Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label="Next Due Date"
            value={formatDate(payment.nextDueDate)}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label="Reminder Date"
            value={formatDate(payment.reminderDate)}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label="Description"
            value={payment.description}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label="Amount"
            value={`${payment.amount} INR`}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label="Frequency"
            value={payment.frequency}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label="Status"
            value={payment.status}
            valueClassName={payment.status === 'Active' ? 'text-green-500' : 'text-red-500'}
            labelWidth="w-[130px]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRecurringPayment;
