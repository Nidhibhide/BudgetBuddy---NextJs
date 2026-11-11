"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
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
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle>{payment.title}</DialogTitle>
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
            value={payment.description || "—"}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label="Amount"
            value={`${payment.amount} ${currency}`}
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
            valueClassName={
              payment.status === "Active" ? "text-success" : "text-destructive"
            }
            labelWidth="w-[130px]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRecurringPayment;
