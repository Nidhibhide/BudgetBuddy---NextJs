"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewRecurringPaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    nextDueDate: string;
    reminderDate: string;
    title: string;
    description: string;
    amount: number;
    frequency: string;
    status: string;
  } | null;
}

const ViewRecurringPayment: React.FC<ViewRecurringPaymentProps> = ({
  open,
  onOpenChange,
  payment,
}) => {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment.title}</DialogTitle>
          <DialogDescription>Recurring Payment Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Next Due Date:</label>
            <p>{new Date(payment.nextDueDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Reminder Date:</label>
            <p>{new Date(payment.reminderDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Description:</label>
            <p>{payment.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Amount:</label>
            <p>{payment.amount} INR</p>
          </div>
          <div>
            <label className="text-sm font-medium">Frequency:</label>
            <p>{payment.frequency}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status:</label>
            <p className={payment.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
              {payment.status}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRecurringPayment;